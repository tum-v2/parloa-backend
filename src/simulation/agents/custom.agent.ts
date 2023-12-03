import { BaseChatModel } from 'langchain/chat_models/base';
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import { BaseMessage } from 'langchain/schema';
import { CustomAgentConfig, RestAPITool, RouteToCoreTool } from './custom.agent.config';
import moment from 'moment';
import { appendFileSync } from 'fs';
import { MsgTypes } from '../db/enum/enums';

export class MsgHistoryItem {
  lcMsg: BaseMessage;
  type: MsgTypes;
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
    type: MsgTypes,
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

    await this.addMessage(new MsgHistoryItem(lcMsg, MsgTypes.SYSTEMPROMPT));

    return this.config.welcomeMessage;
  }

  async processHumanInput(humanInput: string, id: string | null = null): Promise<string> {
    const lcMsg: BaseMessage = await this.getHumanPrompt(humanInput);
    const msg = new MsgHistoryItem(lcMsg, MsgTypes.HUMANINPUT, humanInput, id ?? undefined);
    await this.addMessage(msg);

    let response: Record<string, any> = {};
    let action: string | null = null;
    let actionInput: string | Record<string, any> | null = null;
    let apiToolConfig: RestAPITool | null = null;

    for (;;) {
      const messages: BaseMessage[] = this.messageHistory.map((msg) => msg.lcMsg);

      const responseMessage = await this.chatModel.call(messages);

      response = this.getFixedJson(responseMessage.content.toString());
      action = response.action;
      actionInput = response.action_input ?? {};

      if (action === MsgTypes.MSGTOUSER || action == 'message_to_user' || action == 'None') {
        await this.addMessage(
          new MsgHistoryItem(
            responseMessage,
            MsgTypes.MSGTOUSER,
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
        await this.addMessage(
          new MsgHistoryItem(
            responseMessage,
            MsgTypes.ROUTE,
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
            MsgTypes.TOOLCALL,
            undefined,
            undefined,
            response.intermediate_message,
            action,
            actionInput!,
            undefined,
            id!,
          ),
        );

        const toolOutput: string = apiToolConfig.executeTool(actionInput);

        const lcMsg = await this.getToolOutputPrompt(action, toolOutput);

        await this.addMessage(
          new MsgHistoryItem(
            lcMsg,
            MsgTypes.TOOLOUTPUT,
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

          let output: string | null = null;

          if (tool instanceof RestAPITool) {
            output = tool.response.outputDescription;
          }

          if (output) {
            toolDescriptions[toolName].output = output;
          }
        });
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
    if (msg.type === MsgTypes.SYSTEMPROMPT) {
      this.logChat(`🤖 ${Colors.BLUE}${this.config.welcomeMessage}${Colors.END}`);
    } else if (msg.type === MsgTypes.HUMANINPUT) {
      this.logChat(`${Colors.GREEN}👧 ${msg.userInput}${Colors.END}`, this.isEchoHumanInput);
    } else if (msg.type === MsgTypes.TOOLCALL) {
      this.logChat(`      🛠️ ${Colors.GREY}[${msg.action}] call input: ${JSON.stringify(msg.toolInput)}${Colors.END}`);
    } else if (msg.type === MsgTypes.TOOLOUTPUT) {
      this.logChat(`      🛠️ ${Colors.GREY}[${msg.action}] result: ${msg.toolOutput}${Colors.END}`);
    } else if (msg.type === MsgTypes.MSGTOUSER) {
      this.logChat(`🤖 ${Colors.BLUE}${msg.msgToUser}${Colors.END}`);
    } else if (msg.type === MsgTypes.ROUTE) {
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

  getFixedJson(input: string) {
    try {
      const parsed = JSON.parse(input);
      return parsed;
    } catch (error) {
      let fixedText = input.trim().replace(/"/g, '').replace('{', '').replace('}', '');
      fixedText = '{' + fixedText;
      fixedText = fixedText + '"}';

      fixedText = fixedText.replace(/(\w+):/g, '"$1":'); // Fix keys

      fixedText = fixedText.replace(/: (?!")/g, ': "');

      fixedText = fixedText.replace(/(?<!{)\s*"(\w+)":/g, '","$1":');
      fixedText = fixedText.replace(/""/g, '"');

      console.log('fixed Text: \n' + fixedText);
      const parsed = JSON.parse(fixedText);
      return parsed;
    }
  }
}
