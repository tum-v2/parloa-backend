/* eslint-disable require-jsdoc */
import { SimulationDocument } from '../db/models/simulation.model';
import repositoryFactory from '../db/repositories/factory';
import { ConversationType, SimulationStatus, MsgSender } from '../db/enum/enums';

import { CustomAgent } from '../agents/custom.agent';
import { configureServiceAgent, setupPath } from '../service/conversation.service';
import { AgentDocument } from '../db/models/agent.model';

const agentRepository = repositoryFactory.agentRepository;
const chatRepository = repositoryFactory.chatRepository;

let serviceAgent: CustomAgent | null = null;

/**
 * Start a chat with the service agent
 * @param config - Chat configuration
 * @returns A promise that resolves to the chat simulation object.
 */
async function start(config: Partial<SimulationDocument>): Promise<SimulationDocument> {
  setupPath();

  config.status = SimulationStatus.RUNNING;
  config.type = ConversationType.MANUAL;

  const serviceAgentModel: AgentDocument = await agentRepository.findByParameters(
    config.serviceAgentConfig.llm,
    config.serviceAgentConfig.temperature,
    config.serviceAgentConfig.maxTokens,
    config.serviceAgentConfig.domain,
  );

  serviceAgent = await configureServiceAgent(serviceAgentModel);

  console.log(serviceAgent);

  const agentResponse: string = await serviceAgent.startAgent();

  const chat: SimulationDocument = await chatRepository.create(config);

  await chatRepository.sendMessage(chat._id, agentResponse, MsgSender.AGENT);

  return chat;
}

/**
 * Fetch a chat with a given id
 * @param id - Chat id
 * @returns A promise that resolves to the chat simulation object.
 */
async function getById(id: string): Promise<SimulationDocument | null> {
  return await chatRepository.getById(id);
}

/**
 * Send a message to service agent
 * @param chatId - Chat id
 * @param message - Message
 * @returns A promise that resolves to the message response of service agents.
 */
async function sendMessage(chatId: string, message: string): Promise<string> {
  await chatRepository.sendMessage(chatId, message, MsgSender.USER);

  const agentResponse: string = await forwardMessageToAgentAndWaitResponse(message);

  await chatRepository.sendMessage(chatId, agentResponse, MsgSender.AGENT);

  return agentResponse;
}

async function forwardMessageToAgentAndWaitResponse(message: string): Promise<string> {
  const agentResponse = await serviceAgent.processHumanInput(message);
  return agentResponse;
}

/**
 * Fetch all chats
 * @returns A promise that resolves to all chat simulation objects.
 */
async function getAll(): Promise<SimulationDocument[]> {
  return await chatRepository.findAll();
}

/**
 * End a chat with a given id
 * @param id - Chat id
 * @returns A promise that resolves to the schat imulation object.
 */
async function end(id: string): Promise<SimulationDocument | null> {
  return await chatRepository.end(id);
}

/**
 * Update a chat with a given id
 * @param id - Chat id
 * @param chatData - Chat details
 * @returns A promise that resolves to the chat simulation object.
 */
async function update(id: string, chatData: Partial<SimulationDocument>): Promise<SimulationDocument | null> {
  return await chatRepository.updateById(id, chatData);
}

/**
 * Fetch a chat with a given id
 * @param id - Chat id
 * @returns A promise that resolves to the success of deletion.
 */
async function del(id: string): Promise<boolean> {
  return await chatRepository.deleteById(id);
}

export default {
  start,
  getById,
  update,
  del,
  getAll,
  sendMessage,
  end,
};
