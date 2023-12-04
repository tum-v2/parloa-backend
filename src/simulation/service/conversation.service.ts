/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SimulationDocument } from '../db/models/simulation.model';
import { CustomAgent } from '../agents/custom.agent';
import { getSimConfig } from '../agents/user.agent';
import { BaseChatModel, BaseChatModelParams } from 'langchain/chat_models/base';
import { ChatOpenAI, OpenAIChatInput } from 'langchain/chat_models/openai';
import { AzureOpenAIInput } from 'langchain/chat_models/openai';
import {
  flightBookingAgentConfig,
  fakeUserAgentResponses,
  fakeServiceAgentResponses,
} from '../agents/service/service.agent.flight.booker';
import { Types } from 'mongoose';
import { MsgHistoryItem } from '../agents/custom.agent';
import { AgentDocument, AgentModel } from '../db/models/agent.model';
import { FakeListChatModel } from 'langchain/chat_models/fake';
import { LLMModel } from '../db/enum/enums';
import repositoryFactory from '../db/repositories/factory';
import { MessageDocument } from '../db/models/message.model';
import { MsgSender, MsgTypes, ConversationStatus } from '../db/enum/enums';
import * as fs from 'fs';
import * as path from 'path';

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

export function setupPath() {
  createFile(SERVICE_PROMPT_LOG_FILE_PATH);
  createFile(SERVICE_CHAT_LOG_FILE_PATH);
  createFile(USER_PROMPT_LOG_FILE_PATH);
  createFile(USER_CHAT_LOG_FILE_PATH);
  console.log('Files created successfully.');
}

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function createFile(filePath: string) {
  ensureDirectoryExistence(filePath);
  fs.writeFileSync(filePath, ''); // Creates an empty file
}

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

export async function configureServiceAgent(
  agentData: AgentDocument,
  messageHistory?: MsgHistoryItem[],
): Promise<CustomAgent> {
  let modelName: string;
  let temperature: number;
  let maxTokens: number;

  if (agentData.llm === undefined) {
    modelName = flightBookingAgentConfig.modelName;
  } else {
    modelName = agentData.llm;
  }
  if (agentData.temperature === undefined) {
    temperature = flightBookingAgentConfig.temperature;
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
    flightBookingAgentConfig,
    SERVICE_PROMPT_LOG_FILE_PATH,
    SERVICE_CHAT_LOG_FILE_PATH,
    true,
    true,
    async (agent: CustomAgent, historyItem: MsgHistoryItem): Promise<void> => {},
    messageHistory || [],
  );

  return serviceAgent;
}

async function configureUserAgent(agentData: AgentDocument): Promise<CustomAgent> {
  let modelName: string;
  let temperature: number;
  let maxTokens: number;

  const userSimConfig = getSimConfig(agentData.prompt);
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
    async (agent: CustomAgent, historyItem: MsgHistoryItem): Promise<void> => {},
  );

  return userAgent;
}

export async function createMessageDocument(
  msg: MsgHistoryItem,
  welcomeMessage: string,
  usedEndpoints: string[],
): Promise<MessageDocument> {
  let sender: MsgSender;
  let text: string;

  if (msg.type === MsgTypes.SYSTEMPROMPT) {
    sender = MsgSender.AGENT;
    text = `AGENT: ${welcomeMessage}`;
  } else if (msg.type === MsgTypes.HUMANINPUT) {
    sender = MsgSender.USER;
    text = `USER: ${msg.userInput}`;
  } else if (msg.type === MsgTypes.TOOLCALL) {
    sender = MsgSender.TOOL;
    text = `TOOL: [${msg.action}] call input: ${JSON.stringify(msg.toolInput)}`;
    if (msg.action !== null) {
      usedEndpoints.push(msg.action);
    }
  } else if (msg.type === MsgTypes.TOOLOUTPUT) {
    sender = MsgSender.TOOL;
    text = `TOOL: [${msg.action}] result: ${msg.toolOutput}`;
  } else if (msg.type === MsgTypes.MSGTOUSER) {
    sender = MsgSender.AGENT;
    text = `AGENT: ${msg.msgToUser}`;
  } else if (msg.type === MsgTypes.ROUTE) {
    sender = MsgSender.AGENT;
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
    msgToUser: msg.msgToUser,
    toolOutput: msg.toolOutput,
    parentId: msg.parentId,
  });
  return message;
}

export async function runConversation(serviceAgentData: AgentDocument, userAgentData: AgentDocument) {
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

  try {
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
        await createMessageDocument(serviceAgent.messageHistory[i], serviceAgent.config.welcomeMessage, usedEndpoints),
      );
    }
    if (conversationSuccess) {
      const hangupMessage: MessageDocument = await messageRepository.create({
        sender: MsgSender.USER,
        text: '/hangup',
        type: MsgTypes.HANGUP,
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
    return conversation._id;
  } catch (error) {
    if (error instanceof Error) {
      const er = error as Error;
      console.log('Errors / this : ' + er.message + ' ' + er.stack);
      console.log(`\n👋👋👋 STOPPED by user. Turn count: ${turnCount} 👋👋👋\n`);
      return new Types.ObjectId();
    }
  }
  return new Types.ObjectId();
}

export default {
  setModelConfig,
};
