import { CustomAgent } from '@simulation/agents/custom.agent';
import { getUserConfig } from '@simulation/agents/user.agent';
import {
  fakeUserAgentResponses,
  fakeServiceAgentResponses,
} from '@simulation/agents/service/service.agent.flight.booker';
import { MsgHistoryItem } from '@simulation/agents/custom.agent';

import { LLMModel } from '@enums/llm-model.enum';
import { MsgSender } from '@enums/msg-sender.enum';
import { MsgType } from '@enums/msg-type.enum';
import { ConversationStatus } from '@enums/conversation-status.enum';

import { BaseChatModel, BaseChatModelParams } from 'langchain/chat_models/base';
import { ChatOpenAI, OpenAIChatInput } from 'langchain/chat_models/openai';
import { AzureOpenAIInput } from 'langchain/chat_models/openai';
import { FakeListChatModel } from 'langchain/chat_models/fake';

import { AgentDocument } from '@db/models/agent.model';
import { MessageDocument } from '@db/models/message.model';
import repositoryFactory from '@db/repositories/factory';

import * as fs from 'fs';
import * as path from 'path';
import { ConversationDocument } from '@db/models/conversation.model';
import { createFlightBookingAgent, createInsuranceAgent } from '@simulation/agents/service/service.agent';
import { ConversationDomain } from '@enums/conversation-domain.enum';
import { CustomAgentConfig } from '@simulation/agents/custom.agent.config';

const isDev = process.env.IS_DEVELOPER;
if (isDev === undefined) throw new Error('IS_DEVELOPER Needs to be specified');

const messageRepository = repositoryFactory.messageRepository;
const conversationRepository = repositoryFactory.conversationRepository;

let gpt35openApiKey: string | undefined;
let gpt35azureApiInstanceName: string | undefined;
let gpt35azureApiVersion: string | undefined;
let gpt4openApiKey: string | undefined;
let gpt4azureApiInstanceName: string | undefined;
let gpt4azureApiVersion: string | undefined;

setup();

/**
 * Initializes the application by setting up the necessary environment variables for Azure OpenAI.
 *
 * The function reads the following environment variables:
 * - AZURE_OPENAI_API_KEY
 * - AZURE_OPENAI_API_INSTANCE_NAME
 * - AZURE_OPENAI_API_VERSION
 * - AZURE_OPENAI_4_API_KEY
 * - AZURE_OPENAI_4_INSTANCE_NAME
 * - AZURE_OPENAI_4_API_VERSION
 *
 * If any of these environment variables are not set, the function will throw an error.
 *
 * @throws Error If any of the required environment variables are not set.
 */
function setup() {
  gpt35openApiKey = process.env.AZURE_OPENAI_API_KEY;
  if (gpt35openApiKey === undefined) throw new Error('AZURE_OPENAI_API_KEY Needs to be specified');

  gpt35azureApiInstanceName = process.env.AZURE_OPENAI_API_INSTANCE_NAME;
  if (gpt35azureApiInstanceName === undefined) throw new Error('AZURE_OPENAI_API_INSTANCE_NAME Needs to be specified');

  gpt35azureApiVersion = process.env.AZURE_OPENAI_API_VERSION;
  if (gpt35azureApiVersion === undefined) throw new Error('AZURE_OPENAI_API_VERSION Needs to be specified');

  gpt4openApiKey = process.env.AZURE_OPENAI_4_API_KEY;
  if (gpt4openApiKey === undefined) throw new Error('AZURE_OPENAI_4_API_KEY Needs to be specified');

  gpt4azureApiInstanceName = process.env.AZURE_OPENAI_4_INSTANCE_NAME;
  if (gpt4azureApiInstanceName === undefined) throw new Error('AZURE_OPENAI_4_INSTANCE_NAME Needs to be specified');

  gpt4azureApiVersion = process.env.AZURE_OPENAI_4_API_VERSION;
  if (gpt4azureApiVersion === undefined) throw new Error('AZURE_OPENAI_4_API_VERSION Needs to be specified');
}

const timeStamp = new Date()
  .toISOString()
  .replace(/[-T:\\.]/g, '')
  .substring(0, 15);

const logsDirectory = './message_logs/';
const SERVICE_PROMPT_LOG_FILE_PATH = path.join(logsDirectory, timeStamp + '-SIM-AGENT-PROMPTS.txt');
const SERVICE_CHAT_LOG_FILE_PATH = path.join(logsDirectory, timeStamp + '-SIM-AGENT-CHAT.txt');
const USER_PROMPT_LOG_FILE_PATH = path.join(logsDirectory, timeStamp + '-SIM-HUMAN-PROMPTS.txt');
const USER_CHAT_LOG_FILE_PATH = path.join(logsDirectory, timeStamp + '-SIM-HUMAN-CHAT.txt');

/**
 * Sets up the necessary files for logging.
 *
 * The function creates the following files:
 * - SERVICE_PROMPT_LOG_FILE_PATH
 * - SERVICE_CHAT_LOG_FILE_PATH
 * - USER_PROMPT_LOG_FILE_PATH
 * - USER_CHAT_LOG_FILE_PATH
 *
 * If the files are created successfully, a message is logged to the console.
 */
export function setupPath() {
  createFile(SERVICE_PROMPT_LOG_FILE_PATH);
  createFile(SERVICE_CHAT_LOG_FILE_PATH);
  createFile(USER_PROMPT_LOG_FILE_PATH);
  createFile(USER_CHAT_LOG_FILE_PATH);
  console.log('Files created successfully.');
}

/**
 * Ensures that the directory for a given file path exists.
 *
 * The function checks if the directory for the provided file path exists.
 * If the directory does not exist, the function creates it.
 *
 * @param filePath - The file path for which to ensure directory existence.
 */
function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

/**
 * Creates a new file at the specified file path.
 *
 * The function first ensures that the directory for the file exists.
 * If the directory does not exist, it is created.
 * Then, an empty file is created at the specified file path.
 *
 * @param filePath - The path where the file should be created.
 */
function createFile(filePath: string) {
  ensureDirectoryExistence(filePath);
  fs.writeFileSync(filePath, ''); // Creates an empty file
}

/**
 * Sets the configuration for a specific model.
 *
 * @param modelName - The name of the model.
 * @param temperature - The temperature for the model.
 * @param maxTokens - The maximum number of tokens for the model.
 *
 * @returns - An object containing the model configuration.
 *
 * @throws Error if the provided model name is not supported.
 */
function setModelConfig(
  modelName: string,
  temperature: number,
  maxTokens: number,
): Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams {
  let azureOpenAIApiDeploymentName: string | undefined;
  let azureOpenAIApiKey: string | undefined;
  let azureOpenAIApiInstanceName: string | undefined;
  let azureOpenAIApiVersion: string | undefined;

  if (modelName === LLMModel.GPT35 || modelName === LLMModel.GPT35TURBO) {
    azureOpenAIApiKey = gpt35openApiKey;
    azureOpenAIApiInstanceName = gpt35azureApiInstanceName;
    azureOpenAIApiVersion = gpt35azureApiVersion;
    if (modelName === LLMModel.GPT35) {
      azureOpenAIApiDeploymentName = 'gpt35-llm';
    } else {
      azureOpenAIApiDeploymentName = 'gpt-35-turbo';
    }
  } else if (modelName === LLMModel.GPT4) {
    azureOpenAIApiKey = gpt4openApiKey;
    azureOpenAIApiInstanceName = gpt4azureApiInstanceName;
    azureOpenAIApiVersion = gpt4azureApiVersion;
    azureOpenAIApiDeploymentName = 'gpt-4';
  } else {
    throw new Error('LLM Model not supported');
  }

  const azureOpenAIInput: Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams = {
    modelName: azureOpenAIApiDeploymentName,
    azureOpenAIApiDeploymentName: azureOpenAIApiDeploymentName,
    temperature: temperature,
    azureOpenAIApiKey: azureOpenAIApiKey,
    azureOpenAIApiInstanceName: azureOpenAIApiInstanceName,
    azureOpenAIApiVersion: azureOpenAIApiVersion,
    maxTokens: maxTokens,
  };
  console.log(azureOpenAIInput);
  return azureOpenAIInput;
}

/**
 * Configures a service agent with the provided agent data and message history.
 *
 * @param agentData - The data for the agent.
 * @param messageHistory - An optional array of message history items.
 * @returns - A promise that resolves to a CustomAgent object.
 */
export async function configureServiceAgent(
  agentData: AgentDocument,
  messageHistory?: MsgHistoryItem[],
): Promise<CustomAgent> {
  let modelName: string;
  let temperature: number;
  let maxTokens: number;
  const welcomeMessage: string = agentData.prompt.find((prompt) => prompt.name === 'welcomeMessage')?.content || '';
  const role: string = agentData.prompt.find((prompt) => prompt.name === 'role')?.content || '';
  const persona: string = agentData.prompt.find((prompt) => prompt.name === 'persona')?.content || '';
  const conversationStrategy: string =
    agentData.prompt.find((prompt) => prompt.name === 'conversationStrategy')?.content || '';
  const tasks: string = agentData.prompt.find((prompt) => prompt.name === 'tasks')?.content || '';
  let agentConfig: CustomAgentConfig;

  // Initialize agent config depending on domain
  if (agentData.domain === ConversationDomain.FLIGHT) {
    agentConfig = createFlightBookingAgent(welcomeMessage, role, persona, conversationStrategy, tasks);
  } else {
    // create insurance agent
    agentConfig = createInsuranceAgent();
  }

  // Change tool descriptions of agent config
  const tools: Record<string, string> = JSON.parse(
    agentData.prompt.find((prompt) => prompt.name === 'tools')?.content || '',
  );
  for (const tool in tools) {
    agentConfig.changeToolDescription(tool, tools[tool]);
  }

  // Update agent configuration with agent data
  if (agentData.llm === undefined) {
    modelName = agentConfig.modelName;
  } else {
    modelName = agentData.llm;
  }
  if (agentData.temperature === undefined) {
    temperature = agentConfig.temperature;
  } else {
    temperature = agentData.temperature;
  }
  if (agentData.maxTokens === undefined) {
    maxTokens = 1;
  } else {
    maxTokens = agentData.maxTokens;
  }

  let agentLLM: BaseChatModel;
  if (agentData.llm === LLMModel.FAKE && isDev === 'true') {
    agentLLM = new FakeListChatModel({ responses: fakeServiceAgentResponses, sleep: 100 });
  } else {
    const azureOpenAIInput = setModelConfig(modelName, temperature, maxTokens);
    agentLLM = new ChatOpenAI(azureOpenAIInput);
  }

  const serviceAgent: CustomAgent = new CustomAgent(
    agentLLM,
    agentConfig,
    SERVICE_PROMPT_LOG_FILE_PATH,
    SERVICE_CHAT_LOG_FILE_PATH,
    true,
    true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (agent: CustomAgent, historyItem: MsgHistoryItem): Promise<void> => {},
    messageHistory || [],
  );

  return serviceAgent;
}

/**
 * Configures a user agent with the provided agent data.
 *
 * @param agentData - The data for the agent.
 * @returns - A promise that resolves to a CustomAgent object.
 */
async function configureUserAgent(agentData: AgentDocument): Promise<CustomAgent> {
  let modelName: string;
  let temperature: number;
  let maxTokens: number;

  const userSimConfig = getUserConfig(
    agentData.prompt.find((prompt) => prompt.name === 'role')?.content || '',
    agentData.prompt.find((prompt) => prompt.name === 'persona')?.content || '',
    agentData.prompt.find((prompt) => prompt.name === 'conversationStrategy')?.content || '',
  );
  if (agentData.llm === undefined) {
    modelName = userSimConfig.modelName;
  } else {
    modelName = agentData.llm;
  }
  if (agentData.temperature === undefined) {
    temperature = userSimConfig.temperature;
  } else {
    temperature = agentData.temperature;
  }
  if (agentData.maxTokens === undefined) {
    maxTokens = 1;
  } else {
    maxTokens = agentData.maxTokens;
  }

  let userLLM: BaseChatModel;
  if (agentData.llm === LLMModel.FAKE && isDev === 'true') {
    userLLM = new FakeListChatModel({ responses: fakeUserAgentResponses, sleep: 100 });
  } else {
    const azureOpenAIInput = setModelConfig(modelName, temperature, maxTokens);
    userLLM = new ChatOpenAI(azureOpenAIInput);
  }

  const userAgent: CustomAgent = new CustomAgent(
    userLLM,
    userSimConfig,
    USER_PROMPT_LOG_FILE_PATH,
    USER_CHAT_LOG_FILE_PATH,
    false,
    false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (agent: CustomAgent, historyItem: MsgHistoryItem): Promise<void> => {},
  );

  return userAgent;
}

/**
 * Creates a message document from a message history item.
 *
 * @param msg - The message history item.
 * @param welcomeMessage - The welcome message for the agent.
 * @param usedEndpoints - An array of used endpoints.
 * @returns - A promise that resolves to a MessageDocument object.
 */
export async function createMessageDocument(
  msg: MsgHistoryItem,
  usedEndpoints: string[],
  welcomeMessage?: string,
): Promise<MessageDocument> {
  let sender: MsgSender;
  let text: string;

  if (msg.type === MsgType.SYSTEMPROMPT) {
    sender = MsgSender.AGENT;
    text = `AGENT: ${welcomeMessage}`;
  } else if (msg.type === MsgType.HUMANINPUT) {
    sender = MsgSender.USER;
    text = `USER: ${msg.userInput}`;
  } else if (msg.type === MsgType.TOOLCALL) {
    sender = MsgSender.TOOL;
    text = `TOOL: [${msg.action}] call input: ${JSON.stringify(msg.toolInput)}`;
    if (msg.action !== null) {
      usedEndpoints.push(msg.action);
    }
  } else if (msg.type === MsgType.TOOLOUTPUT) {
    sender = MsgSender.TOOL;
    text = `TOOL: [${msg.action}] result: ${msg.toolOutput}`;
  } else if (msg.type === MsgType.MSGTOUSER) {
    sender = MsgSender.AGENT;
    text = `AGENT: ${msg.msgToUser}`;
  } else if (msg.type === MsgType.ROUTE) {
    sender = MsgSender.TOOL;
    text = `TOOL: ${msg.action} ${msg.toolInput}`;
    if (msg.action !== null) {
      usedEndpoints.push(msg.action);
    }
  } else {
    throw new Error(`Unknown message type: ${msg.type}`);
  }

  const message: MessageDocument = await messageRepository.create({
    sender: sender,
    text: text,
    type: msg.type,
    timestamp: msg.timestamp,
    intermediateMsg: msg.intermediateMsg,
    action: msg.action,
    toolInput: msg.toolInput,
    lcMsg: msg.lcMsg,
    userInput: msg.userInput,
    msgToUser: msg.type == MsgType.SYSTEMPROMPT ? welcomeMessage : msg.msgToUser,
    toolOutput: msg.toolOutput,
    parentId: msg.parentId,
  });
  return message;
}

/**
 * Runs a conversation between a service agent and a user agent.
 *
 * @param serviceAgentData - The data for the service agent.
 * @param userAgentData - The data for the user agent.
 * @returns - The id of the conversation.
 */
export async function runConversation(
  serviceAgentData: AgentDocument,
  userAgentData: AgentDocument,
): Promise<ConversationDocument> {
  const startTime: Date = new Date();
  const conversation = await conversationRepository.create({
    messages: undefined,
    startTime: startTime,
    endTime: undefined,
    status: ConversationStatus.ONGOING,
    usedEndpoints: undefined,
  });
  setupPath();

  const serviceAgent: CustomAgent = await configureServiceAgent(serviceAgentData);
  const userAgent: CustomAgent = await configureUserAgent(userAgentData);

  let agentResponse: string = await serviceAgent.startAgent();

  await userAgent.startAgent();

  const maxTurnCount = 15;
  let turnCount = 0;

  let conversationSuccess: boolean = false;
  let hangupMsgTimestamp: Date;
  while (turnCount < maxTurnCount) {
    const userInput: string = await userAgent.processHumanInput(agentResponse);

    if (userInput.indexOf('/hangup') >= 0) {
      console.log(userInput);
      console.log(`\n👋👋👋 HANGUP by human_sim agent. Turn count: ${turnCount} 👋👋👋\n`);
      conversationSuccess = true;
      hangupMsgTimestamp = new Date();
      break;
    }

    agentResponse = await serviceAgent.processHumanInput(userInput);

    turnCount++;
  }

  const endTime: Date = new Date();

  const usedEndpoints: string[] = [];
  const messages: MessageDocument[] = [];
  for (let i = 0; i < serviceAgent.messageHistory.length; i++) {
    messages.push(
      await createMessageDocument(serviceAgent.messageHistory[i], usedEndpoints, serviceAgent.config.welcomeMessage),
    );
  }
  if (conversationSuccess) {
    const hangupMessage: MessageDocument = await messageRepository.create({
      sender: MsgSender.USER,
      text: '/hangup',
      type: MsgType.HANGUP,
      timestamp: hangupMsgTimestamp!,
      intermediateMsg: undefined,
      action: undefined,
      toolInput: undefined,
    });
    messages.push(hangupMessage);
  }

  conversation.messages = messages.map((msg: MessageDocument) => msg._id);
  conversation.endTime = endTime;
  conversation.status = ConversationStatus.FINISHED;
  conversation.usedEndpoints = usedEndpoints;
  await conversationRepository.updateById(conversation._id, conversation);
  return conversation;
}

export default {
  setModelConfig,
};
