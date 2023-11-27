/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SimulationDocument } from '@simulation/db/models/simulation.model';
import { CustomAgent } from '../agents/custom.agent';
import { getSimConfig } from '../agents/user.agent';
import { BaseChatModel, BaseChatModelParams } from 'langchain/chat_models/base';
import { ChatOpenAI, OpenAIChatInput } from 'langchain/chat_models/openai';
import { AzureOpenAIInput } from 'langchain/chat_models/openai';
import { flightBookingAgentConfig } from '../agents/service/service.agent.flight.booker';
import { Callback, Types } from 'mongoose';
import { MsgHistoryItem } from '../agents/custom.agent';
import { AgentDocument, AgentModel } from '@simulation/db/models/agent.model';
import * as fs from 'fs';
import * as path from 'path';
import { HumanMessage } from 'langchain/schema';
import repositoryFactory from '../db/repositories/factory';
import { MessageDocument } from '../db/models/message.model';
import { MsgSender, MsgTypes, ConversationStatus } from '../db/enum/enums';

const messageRepository = repositoryFactory.messageRepository;
const conversationRepository = repositoryFactory.conversationRepository;

let model = '';
model = 'gpt-4'; //'gpt-35-turbo';

let openApiKey: string | undefined;
let azureApiInstanceName: string | undefined;
let azureApiVersion: string | undefined;
if (model !== 'gpt-4') {
  openApiKey = process.env.AZURE_OPENAI_API_KEY;
  if (openApiKey === undefined) throw new Error('AZURE_OPENAI_API_KEY Needs to be specified');

  azureApiInstanceName = process.env.AZURE_OPENAI_API_INSTANCE_NAME;
  if (azureApiInstanceName === undefined) throw new Error('AZURE_OPENAI_API_INSTANCE_NAME Needs to be specified');

  azureApiVersion = process.env.AZURE_OPENAI_API_VERSION;
  if (azureApiVersion === undefined) throw new Error('AZURE_OPENAI_API_VERSION Needs to be specified');
} else {
  openApiKey = process.env.AZURE_OPENAI_4_API_KEY;
  if (openApiKey === undefined) throw new Error('AZURE_OPENAI_4_API_KEY Needs to be specified');

  azureApiInstanceName = process.env.AZURE_OPENAI_4_INSTANCE_NAME;
  if (azureApiInstanceName === undefined) throw new Error('AZURE_OPENAI_4_INSTANCE_NAME Needs to be specified');

  azureApiVersion = process.env.AZURE_OPENAI_4_API_VERSION;
  if (azureApiVersion === undefined) throw new Error('AZURE_OPENAI_4_API_VERSION Needs to be specified');
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

function setupPath() {
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

async function configureServiceAgent(simulationData: Partial<SimulationDocument>): Promise<CustomAgent> {
  const azureOpenAIInput: Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams = {
    modelName: flightBookingAgentConfig.modelName,
    azureOpenAIApiDeploymentName: model,
    temperature: flightBookingAgentConfig.temperature,
    azureOpenAIApiKey: openApiKey,
    azureOpenAIApiInstanceName: azureApiInstanceName,
    azureOpenAIApiVersion: azureApiVersion,
  };
  const agent_llm = new ChatOpenAI(azureOpenAIInput);

  const serviceAgent: CustomAgent = new CustomAgent(
    agent_llm,
    flightBookingAgentConfig,
    SERVICE_PROMPT_LOG_FILE_PATH,
    SERVICE_CHAT_LOG_FILE_PATH,
    true,
    true,
    async (agent: CustomAgent, historyItem: MsgHistoryItem): Promise<void> => {},
  );

  return serviceAgent;
}
async function configureUserAgent(simulationData: Partial<SimulationDocument>): Promise<CustomAgent> {
  const userSimConfig = getSimConfig('nonative'); // TODO persona

  const azureOpenAIInput: Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams = {
    modelName: userSimConfig.modelName,
    azureOpenAIApiDeploymentName: model,
    temperature: userSimConfig.temperature,
    azureOpenAIApiKey: openApiKey,
    azureOpenAIApiInstanceName: azureApiInstanceName,
    azureOpenAIApiVersion: azureApiVersion,
  };

  const userLLM = new ChatOpenAI(azureOpenAIInput);

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

async function createMessageDocument(
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
  });
  return message;
}

export async function runConversation(simulationData: Partial<SimulationDocument>): Promise<Types.ObjectId> {
  const startTime: Date = new Date();
  const conversation = await conversationRepository.create({
    messages: undefined,
    startTime: startTime,
    endTime: undefined,
    status: ConversationStatus.ONGOING,
    usedEndpoints: undefined,
  });
  setupPath();

  const serviceAgent: CustomAgent = await configureServiceAgent(simulationData);
  const userAgent: CustomAgent = await configureUserAgent(simulationData);

  let agentResponse: string = await serviceAgent.startAgent();

  await userAgent.startAgent();

  const maxTurnCount = 15;
  let turnCount = 0;

  try {
    while (turnCount < maxTurnCount) {
      const userInput: string = await userAgent.processHumanInput(agentResponse);

      if (userInput.indexOf('/hangup') >= 0) {
        console.log(userInput);
        console.log(`\n👋👋👋 HANGUP by human_sim agent. Turn count: ${turnCount} 👋👋👋\n`);
        break;
      }

      agentResponse = await serviceAgent.processHumanInput(userInput);

      turnCount++;
    }
    //const messages: MessageDocument[] = serviceAgent.messageHistory.map((msg: MsgHistoryItem) =>
    //  createMessageDocument(msg, serviceAgent.config.welcomeMessage),
    //);
    const endTime: Date = new Date();

    const usedEndpoints: string[] = [];
    const messages: MessageDocument[] = [];
    for (let i = 0; i < serviceAgent.messageHistory.length; i++) {
      messages.push(
        await createMessageDocument(serviceAgent.messageHistory[i], serviceAgent.config.welcomeMessage, usedEndpoints),
      );
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
