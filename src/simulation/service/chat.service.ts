import { SimulationDocument } from '@simulation/db/models/simulation.model';
import repositoryFactory from '../db/repositories/factory';
import { MessageDocument } from '@simulation/db/models/message.model';
import { SimulationType, SimulationStatus } from '../db/enum/enums';

const chatRepository = repositoryFactory.chatRepository;

/**
 * Start a chat with the service agent
 * @param config - Chat configuration
 * @returns A promise that resolves to the chat simulation object.
 */
async function start(config: Partial<SimulationDocument>): Promise<SimulationDocument> {
  config.status = SimulationStatus.SCHEDULED;
  config.type = SimulationType.MANUAL;
  const chat: SimulationDocument = await chatRepository.create(config);
  //TODO Initialize agent, update chat to SimulationStatus.RUNNING
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
async function sendMessage(chatId: string, message: MessageDocument): Promise<SimulationDocument> {
  const chat: SimulationDocument = await chatRepository.sendMessage(chatId, message);
  return chat;
  // TODO: Forward message to agent (remove void return type afterwards)
  // const agentResponse: MessageDocument = await forward_message_to_agent_and_wait_response()
  // return agentResponse;
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
