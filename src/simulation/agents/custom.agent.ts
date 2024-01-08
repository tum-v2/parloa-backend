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

  async startAgent(): Promise<string> {
    /*Initializes the messages with the starting system prompt and returns the welcome message.
    No LLM call is made.
    Logs if log files set and prints if isVerbose for the class instance"""*/

    const lcMsg: BaseMessage = await this.getSystemPrompt();

    await this.addMessage(new MsgHistoryItem(lcMsg, MsgType.SYSTEMPROMPT));

    return this.config.welcomeMessage;
  }

  async processHumanInput(humanInput: string, id: string | null = null): Promise<string> {
    const lcMsg: BaseMessage = await this.getHumanPrompt(humanInput);
    const msg = new MsgHistoryItem(lcMsg, MsgType.HUMANINPUT, humanInput, id ?? undefined);
    await this.addMessage(msg);

    let response: Record<string, any> = {};
    let action: string | null = null;
    let actionInput: string | Record<string, any> | null = null;
    let apiToolConfig: RestAPITool | null = null;

    for (;;) {
      const messages: BaseMessage[] = this.messageHistory.map((msg) => msg.lcMsg);

      const responseMessage = await this.chatModel.call(messages);

      response = await this.getFixedJson(responseMessage);
      action = response.action;
      actionInput = response.action_input ?? {};

      if (
        action === MsgType.MSGTOUSER ||
        action == 'message_to_user' ||
        action == 'None' ||
        action == 'message_to_agent'
      ) {
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
            id!,
          ),
        );
        break;
      }
      actionInput = actionInput === '' ? {} : actionInput;
      if (typeof actionInput !== 'object') {
        throw new Error(`ERROR: Invalid action_input in response: ${JSON.stringify(response, null, 4)}`);
      }
      if (action && this.config.routingTools[action]) {
        console.log('routingInput: ' + responseMessage.content.toString());

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
            id!,
          ),
        );
        break;
      }

      if (action && !(action in this.config.restApiTools)) {
        throw new Error(`ERROR: Missing or invalid tool in response action: ${JSON.stringify(response, null, 4)}`);
      }

      if (action) {
        apiToolConfig = this.config.restApiTools[action];

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
            id!,
          ),
        );
        const toolOutput: string = await apiToolConfig.executeTool(actionInput);

        const lcMsg = await this.getToolOutputPrompt(action, toolOutput);

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
            id!,
          ),
        );
      }
    }
    return String(actionInput); // type: ignore[reportGeneralTypeIssues] -- we raise in while loop but Pylance doesn't spot
  }

  getSystemPrompt() {
    const toolDescriptions: Record<string, ToolDescription> = {};
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
    return SystemMessagePromptTemplate.fromTemplate(this.config.systemPromptTemplate).format({
      role: this.config.role,
      persona: this.config.persona,
      conversationStrategy: this.config.conversationStrategy,
      tasks: JSON.stringify(this.config.tasks, null, 2),
      currentDate: moment().format('YYYY-MM-DD'),
      formattedTools: JSON.stringify(toolDescriptions, null, 2),
    });
  }

  getHumanPrompt(humanInput: string) {
    return HumanMessagePromptTemplate.fromTemplate(this.config.humanInputTemplate).format({
      humanInput: humanInput,
    });
  }

  getToolOutputPrompt(toolName: string, toolOutput: string) {
    return HumanMessagePromptTemplate.fromTemplate(this.config.toolOutputTemplate).format({
      toolOutput: toolOutput,
      toolName: toolName,
    });
  }

  async addMessage(newMessage: MsgHistoryItem): Promise<void> {
    this.messageHistory.push(newMessage);
    this.logMessage(newMessage);

    if (this.messageCallback) {
      await this.messageCallback(this, newMessage);
    }
  }

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

  logChat(output: string, is_print: boolean = true) {
    if (this.chatLogFilePath) {
      const logItem = output.replace(/\\x1B\[\d+(;\d+)*m/g, '');
      appendFileSync(this.chatLogFilePath, logItem + '\n');
    }
    if (is_print && this.isVerbose) {
      console.log(`${Colors.END}${output}`);
    }
  }

  async getFixedJson(inputBaseMessage: BaseMessage, id: string | null = null) {
    let count = 0;
    const maxCount = 5;
    let baseMesage = inputBaseMessage;
    let input = inputBaseMessage.content.toString();
    while (count++ < maxCount) {
      try {
        const parsed = JSON.parse(input);
        return parsed;
      } catch (error) {
        const firstBraceIndex = input.indexOf('{');

        if (firstBraceIndex !== -1) {
          input = input.substring(firstBraceIndex);
        }

        let fixedText = input.trim().replace(/"/g, '').replace('{', '').replace('}', '');
        fixedText = '{' + fixedText;
        fixedText = fixedText + '"}';

        fixedText = fixedText.replace(/(\w+):/g, '"$1":');
        fixedText = fixedText.replace(/: (?!")/g, ': "');
        fixedText = fixedText.replace(/(?<!{)\s*"(\w+)":/g, '","$1":');
        fixedText = fixedText.replace(/""/g, '"');

        try {
          const parsed = JSON.parse(fixedText);
          console.log('fixed Text: \n' + fixedText);
          return parsed;
        } catch (exc) {
          //console.log('failed fix asking ai: \n' + fixedText + ' count: ' + count);
          console.log(`${Colors.GREY} JSONFIXER Reprompt input: ` + input + `${Colors.END}`);

          await this.addMessage(
            new MsgHistoryItem(
              inputBaseMessage,
              MsgType.TOOLCALL,
              undefined,
              inputBaseMessage.content.toString(),
              undefined,
              undefined,
              undefined,
              undefined,
              id!,
            ),
          );

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
              id!,
            ),
          );
          const messages: BaseMessage[] = this.messageHistory.map((msg) => msg.lcMsg);
          baseMesage = await this.chatModel.call(messages);

          input = baseMesage.content.toString();
        }
      }
    }
  }
}
