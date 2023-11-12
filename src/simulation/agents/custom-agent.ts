import { BaseChatModel } from 'langchain/chat_models/base';
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import { BaseMessage } from 'langchain/schema';
import { CustomAgentConfig, RestAPITool, RouteToCoreTool } from './custom-agent-config';
import moment from 'moment';
import { appendFileSync } from 'fs';

const USER_MESSAGE_ACTION: string = 'message_to_user';

type MsgTypes = 'human_input' | 'system_prompt' | 'tool_call' | 'tool_output' | 'msg_to_user' | 'route';

class MsgHistoryItem {
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

class CustomAgent {
  chat_model: BaseChatModel;
  config: CustomAgentConfig;
  promptLogFilePath: string | null;
  chatLogFilePath: string | null;
  isVerbose: boolean;
  isEchoHumanInput: boolean;
  messageCallback: Callback | null = null;
  combinedTools: { [key: string]: CombinedTool };
  messageHistory: MsgHistoryItem[];

  constructor(
    chat_model: BaseChatModel,
    config: CustomAgentConfig,
    promptLogFilePath?: string | null,
    chatLogFilePath?: string | null,
    isVerbose: boolean = true,
    isEchoHumanInput: boolean = false,
    messageCallback?: Callback,
  ) {
    this.chat_model = chat_model;
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
    this.messageHistory = [];
  }

  async startAgent(): Promise<string> {
    /*Initializes the messages with the starting system prompt and returns the welcome message.
    No LLM call is made.
    Logs if log files set and prints if isVerbose for the class instance"""*/

    const lcMsg: BaseMessage = await this.getSystemPrompt();
    await this.addMessage(new MsgHistoryItem(lcMsg, 'system_prompt'));

    return this.config.welcomeMessage;
  }

  async processHumanInput(humanInput: string, id: string | null = null): Promise<string> {
    const lcMsg: BaseMessage = await this.getHumanPrompt(humanInput);
    await this.addMessage(new MsgHistoryItem(lcMsg, 'human_input', humanInput, id ?? undefined));

    let response: Record<string, any> = {};
    let action: string | null = null;
    let actionInput: string | Record<string, any> | null = null;
    let apiToolConfig: RestAPITool | null = null;

    //call tools  until we get a USER_MESSAGE_ACTION or an action which is not rest_apit_tool
    for (;;) {
      const responseMessage = await this.chat_model.call(this.messageHistory.map((msg) => msg.lcMsg));
      response = JSON.parse(responseMessage.content.toString());
      action = response.get('action');
      actionInput = response.get('action_input', {});

      if (action === USER_MESSAGE_ACTION) {
        await this.addMessage(
          new MsgHistoryItem(
            responseMessage,
            'msg_to_user',
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

      if (typeof actionInput !== 'object') {
        throw new Error(`ERROR: Invalid action_input in response: ${JSON.stringify(response, null, 4)}`);
      }

      if (action && this.config.routingTools[action]) {
        await this.addMessage(
          new MsgHistoryItem(
            responseMessage,
            'route',
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

      // It's API tool time!
      if (action && !(action in this.config.restApiTools)) {
        throw new Error(`ERROR: Missing or invalid tool in response action: ${JSON.stringify(response, null, 4)}`);
      }

      if (action) {
        apiToolConfig = this.config.restApiTools[action];

        await this.addMessage(
          new MsgHistoryItem(
            responseMessage,
            'tool_call',
            undefined,
            undefined,
            response.intermediate_message,
            action,
            actionInput!,
            undefined,
            id!,
          ),
        );

        const toolOutput = apiToolConfig.func(actionInput);
        const lcMsg = await this.getToolOutputPrompt(action, toolOutput);
        await this.addMessage(
          new MsgHistoryItem(lcMsg, 'tool_output', undefined, undefined, undefined, action, undefined, toolOutput, id!),
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
          const param_name = param.nameForPrompt ? param.nameForPrompt : param.name;

          inputs[param_name] = {
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
      conversation: this.config.conversationStrategy,
      tasks: JSON.stringify(this.config.tasks, null, 2),
      current_date: moment().format('YYYY-MM-DD'),
      formatted_tools: JSON.stringify(toolDescriptions, null, 2),
    });
  }

  getHumanPrompt(humanInput: string) {
    return HumanMessagePromptTemplate.fromTemplate(this.config.humanInputTemplate).format({
      human_input: humanInput,
    });
  }

  getToolOutputPrompt(toolName: string, toolOutput: string) {
    return HumanMessagePromptTemplate.fromTemplate(this.config.humanInputTemplate).format({
      tool_output: toolOutput,
      tool_name: toolName,
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
    if (msg.type === 'system_prompt') {
      this.logChat(`🤖 ${Colors.BLUE}${this.config.welcomeMessage}${Colors.END}`);
    } else if (msg.type === 'human_input') {
      this.logChat(`${Colors.GREEN}👧 ${msg.userInput}${Colors.END}`, this.isEchoHumanInput);
    } else if (msg.type === 'tool_call') {
      this.logChat(`      🛠️ ${Colors.GREY}[${msg.action}] call input: ${msg.toolInput}${Colors.END}`);
    } else if (msg.type === 'tool_output') {
      this.logChat(`      🛠️ ${Colors.GREY}[${msg.action}] result: ${msg.toolOutput}${Colors.END}`);
    } else if (msg.type === 'msg_to_user') {
      this.logChat(`🤖 ${Colors.BLUE}${msg.msgToUser}${Colors.END}`);
    } else if (msg.type === 'route') {
      this.logChat(`   ⏳ ${Colors.BLUE}${msg.intermediateMsg}${Colors.END}`);
      this.logChat(`🏓 ${Colors.BLUE}${msg.action} ${Colors.GREY}${msg.toolInput}${Colors.END}`);
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
}
