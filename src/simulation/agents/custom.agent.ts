import { BaseChatModel } from 'langchain/chat_models/base';
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import { BaseMessage } from 'langchain/schema';
import { CustomAgentConfig, RestAPITool, RouteToCoreTool } from '@simulation/agents/custom.agent.config';
import moment from 'moment';
import { appendFileSync } from 'fs';
import { MsgType } from '@enums/msg-type.enum';

export class MsgHistoryItem {
  lcMsg: BaseMessage;
  type: MsgType;
  timestamp: Date;
  userInput: string | null;
  msgToUser: string | null;
  intermediateMsg: string | null;
  action: string | null;
  toolInput: Record<string, any> | null;
  toolOutput: any | null;
  parentId: string | null;

  constructor(
    lcMsg: BaseMessage,
    type: MsgType,
    userInput?: string,
    msgToUser?: string,
    intermediateMsg?: string,
    action?: string,
    toolInput?: Record<string, any>,
    toolOutput?: any,
    parentId?: string,
  ) {
    this.lcMsg = lcMsg;
    this.type = type;
    this.timestamp = new Date();
    this.userInput = userInput || null;
    this.msgToUser = msgToUser || null;
    this.intermediateMsg = intermediateMsg || null;
    this.action = action || null;
    this.toolInput = toolInput || null;
    this.toolOutput = toolOutput || null;
    this.parentId = parentId || null;
  }
}

enum Colors {
  RED = '\u001b[91m',
  GREEN = '\u001b[92m',
  YELLOW = '\u001b[93m',
  BLUE = '\u001b[94m',
  MAGENTA = '\u001b[95m',
  CYAN = '\u001b[96m',
  GREY = '\u001b[90m',
  END = '\u001b[0m',
}

type Callback = (agent: CustomAgent, historyItem: MsgHistoryItem) => Promise<void>;

type CombinedTool = RestAPITool | RouteToCoreTool;

type ParamType = {
  description: string;
  type: string;
};

type ToolDescription = {
  description: string;
  output?: string;
  inputs?: Record<string, ParamType>;
};

export class CustomAgent {
  chatModel: BaseChatModel;
  config: CustomAgentConfig;
  promptLogFilePath: string | null;
  chatLogFilePath: string | null;
  isVerbose: boolean;
  isEchoHumanInput: boolean;
  messageCallback: Callback | null = null;
  combinedTools: { [key: string]: CombinedTool };
  messageHistory: MsgHistoryItem[];

  constructor(
    chatModel: BaseChatModel,
    config: CustomAgentConfig,
    promptLogFilePath?: string | null,
    chatLogFilePath?: string | null,
    isVerbose: boolean = true,
    isEchoHumanInput: boolean = false,
    messageCallback?: Callback,
    messageHistory?: MsgHistoryItem[] | null,
  ) {
    this.chatModel = chatModel;
    this.config = config;
    this.promptLogFilePath = promptLogFilePath || null;
    this.chatLogFilePath = chatLogFilePath || null;
    this.isVerbose = isVerbose;
    this.isEchoHumanInput = isEchoHumanInput;
    this.messageCallback = messageCallback || null;
    this.combinedTools = {
      ...this.config.restApiTools,
      ...this.config.routingTools,
    };
    this.messageHistory = messageHistory || [];
  }
  /**
   * Initializes the custom agent, by adding the systemprompt to its history.
   * No LLM call is made.
   * @returns the welcome message of the custom agent
   */
  async startAgent(): Promise<string> {
    const lcMsg: BaseMessage = await this.getSystemPrompt();
    // console.log(lcMsg.content.toString());
    await this.addMessage(new MsgHistoryItem(lcMsg, MsgType.SYSTEMPROMPT));

    return this.config.welcomeMessage;
  }

  /**
   * This method calls the language model with the new input.
   * It can potentially call different tools, and can reprompt itself to get to a valid result.
   *
   * @param humanInput - the new message input
   * @returns the generated message to the user
   * @throws Errors for AI issues
   */
  async processHumanInput(humanInput: string): Promise<string> {
    // Add the humanInput to the message history
    const lcMsg: BaseMessage = await this.getHumanPrompt(humanInput);
    const msg = new MsgHistoryItem(lcMsg, MsgType.HUMANINPUT, humanInput, undefined);
    await this.addMessage(msg);

    // important variables
    let response: Record<string, any> = {};
    let action: string | null = null;
    let actionInput: string | Record<string, any> | null = null;
    let apiToolConfig: RestAPITool | null = null;

    for (;;) {
      // call languageModel with the messageHistory
      const messages: BaseMessage[] = this.messageHistory.map((msg) => msg.lcMsg);
      const responseMessage = await this.chatModel.call(messages);

      // try to get the message into the desired format
      response = await this.getFixedJson(responseMessage);

      // retrieve the necesarry information
      action = response.action;
      actionInput = response.action_input ?? {};

      // A simple response to the user
      if (
        action === MsgType.MSGTOUSER ||
        action == 'message_to_user' ||
        action == 'None' ||
        action == 'message_to_agent'
      ) {
        // add message to history
        await this.addMessage(
          new MsgHistoryItem(
            responseMessage,
            MsgType.MSGTOUSER,
            undefined,
            String(actionInput),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
          ),
        );
        break;
      }
      // Check if actionInput is valid
      actionInput = actionInput === '' ? {} : actionInput;
      if (typeof actionInput !== 'object') {
        throw new Error(`ERROR: Invalid action_input in response: ${JSON.stringify(response, null, 4)}`);
      }
      // Check if the action is calling a routine tool
      if (action && this.config.routingTools[action]) {
        // add to history
        await this.addMessage(
          new MsgHistoryItem(
            responseMessage,
            MsgType.ROUTE,
            undefined,
            undefined,
            response.intermediate_message,
            action,
            actionInput!,
            undefined,
            undefined,
          ),
        );
        break;
      }
      // Check if it is available in other tools
      if (action && !(action in this.config.restApiTools)) {
        throw new Error(`ERROR: Missing or invalid tool in response action: ${JSON.stringify(response, null, 4)}`);
      }
      // check if is  rest api tool
      if (action) {
        // get tool from dictionary
        apiToolConfig = this.config.restApiTools[action];

        // add toolcall message
        await this.addMessage(
          new MsgHistoryItem(
            responseMessage,
            MsgType.TOOLCALL,
            undefined,
            undefined,
            response.intermediate_message,
            action,
            actionInput!,
            undefined,
            undefined,
          ),
        );

        // execute the tool
        const toolOutput: string = await apiToolConfig.executeTool(actionInput);
        const lcMsg = await this.getToolOutputPrompt(action, toolOutput);

        // add the tooloutput message
        await this.addMessage(
          new MsgHistoryItem(
            lcMsg,
            MsgType.TOOLOUTPUT,
            undefined,
            undefined,
            undefined,
            action,
            undefined,
            toolOutput,
            undefined,
          ),
        );
        // after this the for loop will start again and will trigger another language model call
      }
    }
    return String(actionInput);
  }

  /**
   * Get a SystemPrompt, containing information, like tools, persona, role, conversationstrategy, tasks, currentDate
   * It is mainly used as the initial prompt for the LLM.
   * @param newMessage - the new MsgHistoryItem
   * @returns a formatted string
   */
  getSystemPrompt() {
    const toolDescriptions: Record<string, ToolDescription> = {};
    // loops through the tools to collect data like, request parameteres, description
    for (const toolName in this.combinedTools) {
      const tool = this.combinedTools[toolName];
      if (tool.isActive) {
        toolDescriptions[toolName] = { description: tool.description };

        const inputs: Record<string, ParamType> = {};
        tool.request.parameters.forEach((param) => {
          const paramName = param.nameForPrompt ? param.nameForPrompt : param.name;

          inputs[paramName] = {
            description: param.description,
            type: param.type,
          };
        });
        let output: string | null = null;

        toolDescriptions[toolName].inputs = inputs;

        if (tool instanceof RestAPITool) {
          output = tool.response.outputDescription;
        }

        if (output) {
          toolDescriptions[toolName].output = output;
        }
      }
    }
    // combine all the collected information in a prompt
    return SystemMessagePromptTemplate.fromTemplate(this.config.systemPromptTemplate).format({
      role: this.config.role,
      persona: this.config.persona,
      conversationStrategy: this.config.conversationStrategy,
      tasks: JSON.stringify(this.config.tasks, null, 2),
      currentDate: moment().format('YYYY-MM-DD'),
      formattedTools: JSON.stringify(toolDescriptions, null, 2),
    });
  }

  /**
   * Get a nicely formatted human output.
   * @param newMessage - the new MsgHistoryItem
   * @returns a formatted string
   */
  getHumanPrompt(humanInput: string) {
    return HumanMessagePromptTemplate.fromTemplate(this.config.humanInputTemplate).format({
      humanInput: humanInput,
    });
  }

  /**
   * Get a nicely formatted tool output.
   * @param toolName - the name of the tool
   * @param toolOutput - data the tool wants to send to the model
   * @returns a formatted string
   */
  getToolOutputPrompt(toolName: string, toolOutput: string) {
    return HumanMessagePromptTemplate.fromTemplate(this.config.toolOutputTemplate).format({
      toolOutput: toolOutput,
      toolName: toolName,
    });
  }

  /**
   * Pushes a message to the messageHistory
   * @param newMessage - the new MsgHistoryItem
   */
  async addMessage(newMessage: MsgHistoryItem): Promise<void> {
    this.messageHistory.push(newMessage);
    this.logMessage(newMessage);

    if (this.messageCallback) {
      await this.messageCallback(this, newMessage);
    }
  }

  /**
   * Logs a MsgHistoryItem to the console and log file
   * @param msg - the MsgHistoryItem you want to log
   */
  logMessage(msg: MsgHistoryItem) {
    if (msg.type === MsgType.SYSTEMPROMPT) {
      this.logChat(`🤖 ${Colors.BLUE}${this.config.welcomeMessage}${Colors.END}`);
    } else if (msg.type === MsgType.HUMANINPUT) {
      this.logChat(`${Colors.GREEN}👧 ${msg.userInput}${Colors.END}`, this.isEchoHumanInput);
    } else if (msg.type === MsgType.TOOLCALL) {
      this.logChat(`      🛠️ ${Colors.GREY}[${msg.action}] call input: ${JSON.stringify(msg.toolInput)}${Colors.END}`);
    } else if (msg.type === MsgType.TOOLOUTPUT) {
      this.logChat(`      🛠️ ${Colors.GREY}[${msg.action}] result: ${msg.toolOutput}${Colors.END}`);
    } else if (msg.type === MsgType.MSGTOUSER) {
      this.logChat(`🤖 ${Colors.BLUE}${msg.msgToUser}${Colors.END}`);
    } else if (msg.type === MsgType.ROUTE) {
      this.logChat(`   ⏳ ${Colors.BLUE}${msg.intermediateMsg}${Colors.END}`);
      this.logChat(`🏓 ${Colors.BLUE}${msg.action} ${Colors.GREY}${JSON.stringify(msg.toolInput)}${Colors.END}`);
    }

    if (this.promptLogFilePath) {
      appendFileSync(this.promptLogFilePath, msg.lcMsg.content + '\n');
    }
  }

  /**
   * Logs messages to the console and log files
   * @param output - the text you want to long
   * @param is_print - if it should be printed to the console
   */
  logChat(output: string, is_print: boolean = true) {
    if (this.chatLogFilePath) {
      const logItem = output.replace(/\\x1B\[\d+(;\d+)*m/g, '');
      appendFileSync(this.chatLogFilePath, logItem + '\n');
    }
    if (is_print && this.isVerbose) {
      console.log(`${Colors.END}${output}`);
    }
  }

  /**
   * try to bring the message into proper json format
   * @param inputBaseMessage - the input base message
   * @param maxReprompts - number of max reprompts allowed
   * @returns A promise that resolves to json object
   * @throws Throws an error if it wasn't able to create proper json after maxCount times
   */
  async getFixedJson(inputBaseMessage: BaseMessage, maxReprompts: number = 5): Promise<any> {
    let count: number = 0;
    let baseMessage: BaseMessage = inputBaseMessage;

    // get the text from basemessage
    let text: string = inputBaseMessage.content.toString();

    // the reprompting/fixing loop that tries to get the input in a valid formate
    while (count++ < maxReprompts) {
      try {
        //  try to parse the text
        const parsed = JSON.parse(text);
        return parsed;
      } catch (error) {
        // try to fix the format with a simple algorithm
        const fixedText = this.simpleJsonFix(text);

        try {
          // try to parse the fixed
          const parsed = JSON.parse(fixedText);
          return parsed;
        } catch (exc) {
          // try to fix the json format by reprompting the language model
          baseMessage = await this.repromptJsonFix(baseMessage);
          text = baseMessage.content.toString();
        }
      }
    }
    throw Error('Tried ${count} times to create proper json but failed with ' + text);
  }

  /**
   * fix the json string with a simple algorithm
   * @param input - the string that needs to be fixed
   * @returns the fixed string
   */
  simpleJsonFix(input: string): string {
    // remove white space
    const firstBraceIndex = input.indexOf('{');
    if (firstBraceIndex !== -1) {
      input = input.substring(firstBraceIndex);
    }

    //replace all ", {, }
    let fixedText = input.trim().replace(/"/g, '').replace('{', '').replace('}', '');

    // manually add brackets
    fixedText = '{' + fixedText;
    fixedText = fixedText + '"}';

    // manually add "" and ,
    fixedText = fixedText.replace(/(\w+):/g, '"$1":');
    fixedText = fixedText.replace(/: (?!")/g, ': "');
    fixedText = fixedText.replace(/(?<!{)\s*"(\w+)":/g, '","$1":');
    fixedText = fixedText.replace(/""/g, '"');
    return fixedText;
  }
  /**
   * reprompt the ai to get proper json
   * @param baseMessage - the message that needs to be fixed
   * @returns A new BaseMessage that hopefully works
   */
  async repromptJsonFix(baseMessage: BaseMessage): Promise<BaseMessage> {
    // add input message to history
    await this.addMessage(
      new MsgHistoryItem(
        baseMessage,
        MsgType.TOOLCALL,
        undefined,
        baseMessage.content.toString(),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    );

    // create a new message, asking the model to adjust the output
    const msg = `JSON: Couldn't read your output. Remember to print only proper json! The format looks like this.  {"thought":"fill your thoughts here", "action":"your action e.g. message_to_user, auth ..","action_input": "either text" or input for tools: {}}. Only send the json blib in the brackets, nothing before or after!`;
    await this.addMessage(
      new MsgHistoryItem(
        await this.getHumanPrompt(msg),
        MsgType.TOOLOUTPUT,
        undefined,
        undefined,
        undefined,
        'error',
        undefined,
        msg,
        undefined,
      ),
    );
    // call the language model with the new messages
    const messages: BaseMessage[] = this.messageHistory.map((msg) => msg.lcMsg);
    return await this.chatModel.call(messages);
  }
}
