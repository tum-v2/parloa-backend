import { BaseChatModel } from "langchain/chat_models/base";
import {
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { BaseMessage } from "langchain/schema";
import {
  CustomAgentConfig,
  RestAPITool,
  RouteToCoreTool,
} from "./custom-agent-config";

import moment = require("moment");
import * as fs from "fs";
import { type } from "os";

const USER_MESSAGE_ACTION: string = "message_to_user";

type MsgTypes =
  | "human_input"
  | "system_prompt"
  | "tool_call"
  | "tool_output"
  | "msg_to_user"
  | "route";

class MsgHistoryItem {
  lc_msg: BaseMessage;
  type: MsgTypes;
  timestamp: Date;
  user_input: string | null;
  msg_to_user: string | null;
  intermediate_msg: string | null;
  action: string | null;
  tool_input: Record<string, any> | null;
  tool_output: any | null;
  parent_id: string | null;

  constructor(
    lc_msg: BaseMessage,
    type: MsgTypes,
    user_input?: string,
    msg_to_user?: string,
    intermediate_msg?: string,
    action?: string,
    tool_input?: Record<string, any>,
    tool_output?: any,
    parent_id?: string
  ) {
    this.lc_msg = lc_msg;
    this.type = type;
    this.timestamp = new Date();
    this.user_input = user_input || null;
    this.msg_to_user = msg_to_user || null;
    this.intermediate_msg = intermediate_msg || null;
    this.action = action || null;
    this.tool_input = tool_input || null;
    this.tool_output = tool_output || null;
    this.parent_id = parent_id || null;
  }
}

enum Colors {
  RED = "\u001b[91m",
  GREEN = "\u001b[92m",
  YELLOW = "\u001b[93m",
  BLUE = "\u001b[94m",
  MAGENTA = "\u001b[95m",
  CYAN = "\u001b[96m",
  GREY = "\u001b[90m",
  END = "\u001b[0m",
}

type Callback = (
  agent: CustomAgent,
  historyItem: MsgHistoryItem
) => Promise<void>;

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
  prompt_log_file_path: string | null;
  chat_log_file_path: string | null;
  is_verbose: boolean;
  is_echo_human_input: boolean;
  message_callback: Callback | null = null;
  combinedTools: { [key: string]: CombinedTool };
  messageHistory: MsgHistoryItem[];

  constructor(
    chat_model: BaseChatModel,
    config: CustomAgentConfig,
    prompt_log_file_path?: string | null,
    chat_log_file_path?: string | null,
    is_verbose: boolean = true,
    is_echo_human_input: boolean = false,
    message_callback?: Callback
  ) {
    this.chat_model = chat_model;
    this.config = config;
    this.prompt_log_file_path = prompt_log_file_path || null;
    this.chat_log_file_path = chat_log_file_path || null;
    this.is_verbose = is_verbose;
    this.is_echo_human_input = is_echo_human_input;
    this.message_callback = message_callback || null;
    this.combinedTools = {
      ...this.config.rest_api_tools,
      ...this.config.routing_tools,
    };
    this.messageHistory = [];
  }

  async start_agent(): Promise<string> {
    /*Initializes the messages with the starting system prompt and returns the welcome message.
    No LLM call is made.
    Logs if log files set and prints if is_verbose for the class instance"""*/

    const lc_msg: BaseMessage = await this._get_system_prompt();
    await this._add_message(new MsgHistoryItem(lc_msg, "system_prompt"));

    return this.config.welcome_message;
  }

  async process_human_input(
    human_input: string,
    id: string | null = null
  ): Promise<string> {
    const lc_msg: BaseMessage = await this._get_human_prompt(human_input);
    await this._add_message(
      new MsgHistoryItem(lc_msg, "human_input", human_input, id ?? undefined)
    );

    let response: Record<string, any> = {};
    let action: string | null = null;
    let action_input: string | Record<string, any> | null = null;
    let api_tool_config: RestAPITool | null = null;

    //call tools  until we get a USER_MESSAGE_ACTION or an action which is not rest_apit_tool
    while (true) {
      let response_message = await this.chat_model.call(
        this.messageHistory.map((msg) => msg.lc_msg)
      );
      const response = JSON.parse(response_message.content);
      const action = response.get("action");
      const actionInput = response.get("action_input", {});

      if (action === USER_MESSAGE_ACTION) {
        await this._add_message(
          new MsgHistoryItem(
            response_message,
            "msg_to_user",
            action_input ?? undefined,
            id ?? undefined
          )
        );
        break;
      }
    }
    return "";
  }

  _get_system_prompt() {
    let toolDescriptions: Record<string, ToolDescription> = {};
    for (const tool_name in this.combinedTools) {
      let tool = this.combinedTools[tool_name];
      if (tool.is_active) {
        toolDescriptions[tool_name] = { description: tool.description };

        tool.request.parameters.forEach((param) => {
          const param_name = param.name_for_prompt
            ? param.name_for_prompt
            : param.name;

          let inputs: Record<string, ParamType> = {};
          inputs[param_name] = {
            description: param.description,
            type: param.type,
          };

          let output: string | null = null;

          if (tool instanceof RestAPITool) {
            output = tool.response.output_description;
          }

          if (output) {
            toolDescriptions[tool_name].output = output;
          }
        });
      }
    }
    return SystemMessagePromptTemplate.fromTemplate(
      this.config.system_prompt_template
    ).format({
      role: this.config.role,
      persona: this.config.persona,
      conversation: this.config.conversation_strategy,
      tasks: JSON.stringify(this.config.tasks, null, 2),
      current_date: moment().format("YYYY-MM-DD"),
      formatted_tools: JSON.stringify(toolDescriptions, null, 2),
    });
  }

  _get_human_prompt(human_input: string) {
    return HumanMessagePromptTemplate.fromTemplate(
      this.config.human_input_template
    ).format({
      human_input: human_input,
    });
  }

  _get_tool_output_prompt(tool_name: string, tool_output: string) {
    return HumanMessagePromptTemplate.fromTemplate(
      this.config.human_input_template
    ).format({
      tool_output: tool_output,
      tool_name: tool_name,
    });
  }

  async _add_message(new_message: MsgHistoryItem): Promise<void> {
    this.messageHistory.push(new_message);
    this._log_message(new_message);

    if (this.message_callback) {
      await this.message_callback(this, new_message);
    }
  }

  _log_message(msg: MsgHistoryItem) {
    if (msg.type === "system_prompt") {
      this._log_chat(
        `🤖 ${Colors.BLUE}${this.config.welcome_message}${Colors.END}`
      );
    } else if (msg.type === "human_input") {
      this._log_chat(
        `${Colors.GREEN}👧 ${msg.user_input}${Colors.END}`,
        this.is_echo_human_input
      );
    } else if (msg.type === "tool_call") {
      this._log_chat(
        `      🛠️ ${Colors.GREY}[${msg.action}] call input: ${msg.tool_input}${Colors.END}`
      );
    } else if (msg.type === "tool_output") {
      this._log_chat(
        `      🛠️ ${Colors.GREY}[${msg.action}] result: ${msg.tool_output}${Colors.END}`
      );
    } else if (msg.type === "msg_to_user") {
      this._log_chat(`🤖 ${Colors.BLUE}${msg.msg_to_user}${Colors.END}`);
    } else if (msg.type === "route") {
      this._log_chat(
        `   ⏳ ${Colors.BLUE}${msg.intermediate_msg}${Colors.END}`
      );
      this._log_chat(
        `🏓 ${Colors.BLUE}${msg.action} ${Colors.GREY}${msg.tool_input}${Colors.END}`
      );
    }

    if (this.prompt_log_file_path) {
      fs.appendFileSync(this.prompt_log_file_path, msg.lc_msg.content + "\n");
    }
  }

  _log_chat(output: string, is_print: boolean = true) {
    if (this.chat_log_file_path) {
      const logItem = output.replace(/\x1B\[\d+(;\d+)*m/g, "");
      fs.appendFileSync(this.chat_log_file_path, logItem + "\n");
    }
    if (is_print && this.is_verbose) {
      console.log(`${Colors.END}${output}`);
    }
  }
}
