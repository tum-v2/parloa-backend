import { appendFileSync } from 'fs';
import { BaseChatModel } from 'langchain/chat_models/base';
import { BaseMessage } from 'langchain/schema';
import { AgentConfig, RestAPITool } from './agent-config';
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';

interface MsgHistoryItem {
  lc_msg: BaseMessage;
  type: 'human_input' | 'system_prompt' | 'tool_call' | 'tool_output' | 'msg_to_user' | 'route';
  timestamp: Date;
  user_input?: string | null;
  msg_to_user?: string | null;
  intermediate_msg?: string | null;
  action?: string | null;
  tool_input?: Record<string, any> | null;
  tool_output?: any | null;
  parent_id?: string | null;
}

class Colors {
  static RED = '\x1b[91m';
  static GREEN = '\x1b[92m';
  static YELLOW = '\x1b[93m';
  static BLUE = '\x1b[94m';
  static MAGENTA = '\x1b[95m';
  static CYAN = '\x1b[96m';
  static GREY = '\x1b[90m';
  static END = '\x1b[0m';
}

type MessageCallback = (customAgent: CustomAgent, msgHistoryItem: MsgHistoryItem) => Promise<void>;

export class CustomAgent {
  chat_model: BaseChatModel;
  config: AgentConfig;
  prompt_log_file_path: string | null;
  chat_log_file_path: string | null;
  is_verbose: boolean;
  is_echo_human_input: boolean;
  message_callback: MessageCallback | null;
  message_history: MsgHistoryItem[];

  constructor(
    chat_model: BaseChatModel,
    config: AgentConfig,
    prompt_log_file_path: string | null,
    chat_log_file_path: string | null,
    is_verbose: boolean = true,
    is_echo_human_input: boolean = false,
    message_callback: MessageCallback | null = null,
  ) {
    this.chat_model = chat_model;
    this.config = config;
    this.prompt_log_file_path = prompt_log_file_path;
    this.chat_log_file_path = chat_log_file_path;
    this.is_verbose = is_verbose;
    this.is_echo_human_input = is_echo_human_input;
    this.message_callback = message_callback;
    this.message_history = [];
  }

  async startAgent(): Promise<string> {
    await this.addMessage({
      type: 'system_prompt',
      lc_msg: this.getSystemPrompt(),
      timestamp: new Date(),
    });

    return this.config.welcome_message;
  }

  async processHumanInput(human_input: string, id: string | null = null): Promise<string> {
    await this.addMessage({
      type: 'human_input',
      lc_msg: this.getHumanPrompt(human_input),
      user_input: human_input,
      parent_id: id,
      timestamp: new Date(),
    });

    let response: Record<string, any> = {};
    let action: string | null = null;
    let action_input: string | Record<string, any> | null = null;
    let api_tool_config: RestAPITool | null = null;

    // Call tools until we get a USER_MESSAGE_ACTION or an action which is not a rest_api_tool
    for (;;) {
      const responseMessage = await this.chat_model.call(this.message_history.map((item) => item.lc_msg));

      response = JSON.parse(responseMessage.content.toString());
      action = response.action;
      action_input = response.action_input || {};

      if (action === 'message_to_user') {
        await this.addMessage({
          type: 'msg_to_user',
          msg_to_user: String(action_input),
          lc_msg: responseMessage,
          parent_id: id,
          timestamp: new Date(),
        });
        break;
      }

      if (typeof action_input !== 'object') {
        throw new Error(`ERROR: Invalid action_input in response: ${JSON.stringify(response, null, 4)}`);
      }

      if (action && this.config.routing_tools[action]) {
        await this.addMessage({
          type: 'route',
          action,
          tool_input: action_input,
          intermediate_msg: response.intermediate_message,
          lc_msg: responseMessage,
          parent_id: id,
          timestamp: new Date(),
        });
        break;
      }

      // It's API tool time!
      if (action && !(action in this.config.rest_api_tools)) {
        throw new Error(`ERROR: Missing or invalid tool in response action: ${JSON.stringify(response, null, 4)}`);
      }

      if (action) {
        api_tool_config = this.config.rest_api_tools[action];

        await this.addMessage({
          type: 'tool_call',
          action,
          tool_input: action_input,
          intermediate_msg: response.intermediate_message,
          lc_msg: responseMessage,
          parent_id: id,
          timestamp: new Date(),
        });

        const toolOutput = api_tool_config.func(action_input);
        await this.addMessage({
          type: 'tool_output',
          action,
          tool_output: toolOutput,
          lc_msg: this.getToolOutputPrompt(action, toolOutput),
          parent_id: id,
          timestamp: new Date(),
        });
      }
    }

    return String(action_input); // type: ignore[reportGeneralTypeIssues] -- we raise in while loop but Pylance doesn't spot
  }

  private getSystemPrompt(): any {
    const toolDescriptions: Record<string, Record<string, any>> = {};
    for (const [toolName, tool] of Object.entries({
      ...this.config.rest_api_tools,
      ...this.config.routing_tools,
    })) {
      if (tool.is_active) {
        toolDescriptions[toolName] = { description: tool.description };

        const inputs: Record<string, any> = {};
        for (const param of tool.request.parameters) {
          if (param.expected_from_llm) {
            const paramName = param.name_for_prompt || param.name;

            inputs[paramName] = {
              description: param.description,
              type: param.type,
            };
          }
        }
        if (Object.keys(inputs).length > 0) {
          toolDescriptions[toolName].input = inputs;
        }

        const output = (tool as any).response?.output_description || null;
        if (output) {
          toolDescriptions[toolName].output = output;
        }
      }
    }

    return SystemMessagePromptTemplate.fromTemplate(this.config.system_prompt_template).format({
      role: this.config.role,
      persona: this.config.persona,
      conversation_strategy: this.config.conversation_strategy,
      tasks: JSON.stringify(this.config.tasks, null, 2),
      current_date: new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      formatted_tools: JSON.stringify(toolDescriptions, null, 2),
    });
  }

  private getHumanPrompt(humanInput: string): any {
    return HumanMessagePromptTemplate.fromTemplate(this.config.human_input_template).format({
      human_input: humanInput,
    });
  }

  private getToolOutputPrompt(toolName: string, toolOutput: any): any {
    return HumanMessagePromptTemplate.fromTemplate(this.config.tool_output_template).format({
      tool_output: toolOutput,
      tool_name: toolName,
    });
  }

  private async addMessage(newMessage: MsgHistoryItem): Promise<void> {
    this.message_history.push(newMessage);
    this.logMessage(newMessage);

    if (this.message_callback) {
      await this.message_callback(this, newMessage);
    }
  }

  private logMessage(msg: MsgHistoryItem): void {
    switch (msg.type) {
      case 'system_prompt':
        this.logChat(`🤖 ${Colors.BLUE}${this.config.welcome_message}${Colors.END}`);
        break;
      case 'human_input':
        this.logChat(`${Colors.GREEN}👧 ${msg.user_input}${Colors.END}`, this.is_echo_human_input);
        break;
      case 'tool_call':
        this.logChat(`   ⏳ ${Colors.BLUE}${msg.intermediate_msg}${Colors.END}`);
        this.logChat(
          `      🛠️ ${Colors.GREY}[${msg.action}] call input: ${JSON.stringify(msg.tool_input)}${Colors.END}`,
        );
        break;
      case 'tool_output':
        this.logChat(`      🛠️ ${Colors.GREY}[${msg.action}] result: ${JSON.stringify(msg.tool_output)}${Colors.END}`);
        break;
      case 'msg_to_user':
        this.logChat(`🤖 ${Colors.BLUE}${msg.msg_to_user}${Colors.END}`);
        break;
      case 'route':
        this.logChat(`   ⏳ ${Colors.BLUE}${msg.intermediate_msg}${Colors.END}`);
        this.logChat(`️️️️🏓 ${Colors.BLUE}${msg.action} ${Colors.GREY}${JSON.stringify(msg.tool_input)}${Colors.END}`);
        break;
    }

    if (this.prompt_log_file_path) {
      appendFileSync(this.prompt_log_file_path, msg.lc_msg.content.toString());
    }
  }

  private logChat(output: string, isPrint: boolean = true): void {
    if (this.chat_log_file_path) {
      const logItem = output.replace(/\\x1B\[\d+(;\d+)*m/g, ''); // Remove color codes
      appendFileSync(this.chat_log_file_path, logItem + '\n');
    }

    if (this.is_verbose && isPrint) {
      console.log(`${Colors.END}${output}`);
    }
  }
}
