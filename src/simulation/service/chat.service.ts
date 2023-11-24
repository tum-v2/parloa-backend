import { SimulationDocument } from '@simulation/db/models/simulation.model';
import repositoryFactory from '../db/repositories/factory';
import { MessageDocument } from '@simulation/db/models/message.model';
import { ConversationType, SimulationStatus } from '../db/enum/enums';

const chatRepository = repositoryFactory.chatRepository;

async function start(config: Partial<SimulationDocument>): Promise<SimulationDocument> {
  config.status = SimulationStatus.SCHEDULED;
  config.type = ConversationType.MANUAL;
  const chat: SimulationDocument = await chatRepository.create(config);
  //TODO Initialize agent, update chat to SimulationStatus.RUNNING
  return chat;
}

async function getById(id: string): Promise<SimulationDocument | null> {
  return await chatRepository.getById(id);
}

async function sendMessage(chatId: string, message: MessageDocument): Promise<SimulationDocument> {
  const chat: SimulationDocument = await chatRepository.sendMessage(chatId, message);
  return chat;
  // TODO: Forward message to agent (remove void return type afterwards)
  // const agentResponse: MessageDocument = await forward_message_to_agent_and_wait_response()
  // return agentResponse;
}

async function getAll(): Promise<SimulationDocument[]> {
  return await chatRepository.findAll();
}

async function end(id: string): Promise<SimulationDocument | null> {
  return await chatRepository.end(id);
}

async function update(id: string, chatData: Partial<SimulationDocument>): Promise<SimulationDocument | null> {
  return await chatRepository.updateById(id, chatData);
}

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
