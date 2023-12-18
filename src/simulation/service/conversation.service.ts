import { CustomAgent } from '@simulation/agents/custom.agent';
import { getSimConfig } from '@simulation/agents/user.agent';
import {
  flightBookingAgentConfig,
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
import { Types } from 'mongoose';
import { ConversationDocument } from '@db/models/conversation.model';

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

setOpenAIVariables();

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
function setOpenAIVariables() {
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

// create a timestamp and adapt the format for the log files
const timeStamp = new Date()
  .toISOString()
  .replace(/[-T:\\.]/g, '')
  .substring(0, 15);

// path of the directory for the log files
const logsDirectory = './message_logs/';

// paths of the log files
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
 * @returns - An object containing the ChatOpenAI model configuration.
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

  // check which model is used and set the corresponding variables
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

  // set the model configuration that is later passed when creating the ChatOpenAI model
  const azureOpenAIInput: Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams = {
    modelName: azureOpenAIApiDeploymentName,
    azureOpenAIApiDeploymentName: azureOpenAIApiDeploymentName,
    temperature: temperature,
    azureOpenAIApiKey: azureOpenAIApiKey,
    azureOpenAIApiInstanceName: azureOpenAIApiInstanceName,
    azureOpenAIApiVersion: azureOpenAIApiVersion,
    maxTokens: maxTokens,
  };
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
  let agentLLM: BaseChatModel;
  // either create a fake agent or an agent with the provided model configuration
  if (agentData.llm === LLMModel.FAKE && isDev === 'true') {
    agentLLM = new FakeListChatModel({ responses: fakeServiceAgentResponses, sleep: 100 });
  } else {
    const azureOpenAIInput = setModelConfig(agentData.llm, agentData.temperature, agentData.maxTokens);
    agentLLM = new ChatOpenAI(azureOpenAIInput);
  }

  // either use a default persona or the provided persona
  if (agentData.prompt !== 'default') {
    flightBookingAgentConfig.persona = agentData.prompt;
  } else {
    flightBookingAgentConfig.persona = `- You should be empathetic, helpful, comprehensive and polite.
    - Never use gender specific prefixes like Mr. or Mrs. when addressing the user unless they used it themselves.
    `;
  }

  // create the service agent
  const serviceAgent: CustomAgent = new CustomAgent(
    agentLLM,
    flightBookingAgentConfig,
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
  let userLLM: BaseChatModel;
  // either create a fake agent or an agent with the provided model configuration
  if (agentData.llm === LLMModel.FAKE && isDev === 'true') {
    userLLM = new FakeListChatModel({ responses: fakeUserAgentResponses, sleep: 100 });
  } else {
    const azureOpenAIInput = setModelConfig(agentData.llm, agentData.temperature, agentData.maxTokens);
    userLLM = new ChatOpenAI(azureOpenAIInput);
  }

  // get the user agent configuration
  const userSimConfig = getSimConfig(agentData.prompt);

  // create the user agent
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

  // set the sender and add the sender in the beginning of the message for a better overview depending on the message type
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
    sender = MsgSender.AGENT;
    text = `TOOL: ${msg.action} ${msg.toolInput}`;
    if (msg.action !== null) {
      usedEndpoints.push(msg.action);
    }
  } else {
    throw new Error(`Unknown message type: ${msg.type}`);
  }

  // create the message document
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
 * Save all messages to the database and return their ids.
 *
 * @param serviceAgent - The service agent.
 * @param usedEndpoints - An array of used endpoints.
 * @returns - A promise that resolves to an array of message ids.
 */
async function saveMessagesToDB(serviceAgent: CustomAgent, usedEndpoints: string[]): Promise<Types.ObjectId[]> {
  const messages: MessageDocument[] = [];

  // create a message document for each message history item
  for (let i = 0; i < serviceAgent.messageHistory.length; i++) {
    messages.push(
      await createMessageDocument(serviceAgent.messageHistory[i], usedEndpoints, serviceAgent.config.welcomeMessage),
    );
  }

  // return the ids of the messages
  return messages.map((msg: MessageDocument) => msg._id);
}

/**
 * Update the conversation with the messages, used endpoints, endTime and it's status
 *
 * @param conversation - The conversation document.
 * @param messages - An array of messages.
 * @param usedEndpoints - An array of used endpoints.
 * @returns - A promise that resolves to a ConversationDocument object.
 */
async function updateConversation(
  conversation: ConversationDocument,
  messages: Types.ObjectId[],
  usedEndpoints: string[],
  conversationSuccess: boolean,
  hangupMsgTimestamp: Date,
  endTime: Date,
) {
  // add the hangup message if the conversation was successful
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
    messages.push(hangupMessage._id);
  }
  conversation.messages = messages;
  conversation.endTime = endTime;
  conversation.status = ConversationStatus.FINISHED;
  conversation.usedEndpoints = usedEndpoints;

  // update the conversation
  await conversationRepository.updateById(conversation._id, conversation);
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
  // creates all important files needed for this conversation: e.g. log files
  setupPath();

  // configure service and user agents with the request data
  const serviceAgent: CustomAgent = await configureServiceAgent(serviceAgentData);
  const userAgent: CustomAgent = await configureUserAgent(userAgentData);

  // start the two agents, by adding their initial prompt to their message history
  let agentResponse: string = await serviceAgent.startAgent();
  await userAgent.startAgent();

  const maxTurnCount = 15;
  let turnCount = 0;

  try {
    let conversationSuccess: boolean = false;
    let hangupMsgTimestamp: Date = new Date();
    // the main conversation loop
    while (turnCount < maxTurnCount) {
      // calling the user language model with the new input
      const userInput: string = await userAgent.processHumanInput(agentResponse);

      if (userInput.indexOf('/hangup') >= 0) {
        // /hangup can be triggered by the user agent, and finishes the conversation
        console.log(userInput);
        console.log(`\n👋👋👋 HANGUP by human_sim agent. Turn count: ${turnCount} 👋👋👋\n`);
        conversationSuccess = true;
        hangupMsgTimestamp = new Date();
        break;
      }
      // calling the service language model with the new input
      agentResponse = await serviceAgent.processHumanInput(userInput);

      turnCount++;
    }

    const usedEndpoints: string[] = [];

    // update the conversation with the messages, used endpoints, endTime and it's status
    updateConversation(
      conversation,
      await saveMessagesToDB(serviceAgent, usedEndpoints),
      usedEndpoints,
      conversationSuccess,
      hangupMsgTimestamp,
      new Date(),
    );
    return conversation;
  } catch (error) {
    if (error instanceof Error) {
      const er = error as Error;
      console.log('Errors / this : ' + er.message + ' ' + er.stack);
      console.log(`\n👋👋👋 STOPPED by user. Turn count: ${turnCount} 👋👋👋\n`);
      throw error;
    }
  }
  throw new Error('Conversation could not be finished');
}

export default {
  setModelConfig,
};
