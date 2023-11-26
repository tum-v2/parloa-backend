/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SimulationDocument } from '../db/models/simulation.model';
import { CustomAgent } from '../agents/custom.agent';
import { getSimConfig } from '../agents/user.agent';
import { BaseChatModel, BaseChatModelParams } from 'langchain/chat_models/base';
import { ChatOpenAI, OpenAIChatInput } from 'langchain/chat_models/openai';
import { AzureOpenAIInput } from 'langchain/chat_models/openai';
import { flightBookingAgentConfig } from '../agents/service/service.agent.flight.booker';
import { Callback } from 'mongoose';
import { MsgHistoryItem } from '../agents/custom.agent';
import { AgentDocument, AgentModel } from '../db/models/agent.model';
import * as fs from 'fs';
import * as path from 'path';
import { HumanMessage } from 'langchain/schema';

let model = '';
model = 'gpt-4';
// model = 'gpt-35-turbo';

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

export async function configureServiceAgent(agent: AgentDocument): Promise<CustomAgent> {
  const azureOpenAIInput: Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams = {
    modelName: agent.llm,
    azureOpenAIApiDeploymentName: model,
    temperature: agent.temperature,
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

export async function configureUserAgent(agent: AgentDocument): Promise<CustomAgent> {
  const userSimConfig = getSimConfig('sarcastic'); // TODO persona

  const azureOpenAIInput: Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams = {
    modelName: agent.llm,
    azureOpenAIApiDeploymentName: model,
    temperature: agent.temperature,
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

export async function runConversation(serviceAgentConfig: AgentDocument, userAgentConfig: AgentDocument) {
  setupPath();

  const serviceAgent: CustomAgent = await configureServiceAgent(serviceAgentConfig);
  const userAgent: CustomAgent = await configureUserAgent(userAgentConfig);

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
        return;
      }

      agentResponse = await serviceAgent.processHumanInput(userInput);

      turnCount++;
    }
  } catch (error) {
    if (error instanceof Error) {
      const er = error as Error;
      console.log('Errors / this : ' + er.message + ' ' + er.stack);
      console.log(`\n👋👋👋 STOPPED by user. Turn count: ${turnCount} 👋👋👋\n`);
      return;
    }
  }
}
