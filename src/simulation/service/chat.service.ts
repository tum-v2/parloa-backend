/* eslint-disable require-jsdoc */
import { SimulationDocument, SimulationModel } from '../db/models/simulation.model';
import repositoryFactory from '../db/repositories/factory';
import { SimulationType, SimulationStatus, MsgTypes, MsgSender } from '../db/enum/enums';

import { CustomAgent } from '../agents/custom.agent';
import { configureServiceAgent, createMessageDocument, setupPath } from '../service/conversation.service';
import { AgentDocument } from '../db/models/agent.model';
import { MessageDocument } from '../db/models/message.model';
import ChatMessage from '../model/response/chat.response';
import { StartChatRequest } from '@simulation/model/request/chat.request';

const agentRepository = repositoryFactory.agentRepository;
const chatRepository = repositoryFactory.chatRepository;

let serviceAgent: CustomAgent | null = null;
let count = 0;

/**
 * Start a chat with the service agent
 * @param config - Chat configuration
 * @returns A promise that resolves to the chat simulation object.
 */
async function start(config: StartChatRequest): Promise<SimulationDocument> {
  setupPath();

  const simulation: SimulationDocument = new SimulationModel();

  simulation.name = config.name;
  simulation.serviceAgent = config.serviceAgent;
  simulation.status = SimulationStatus.RUNNING;
  simulation.type = SimulationType.CHAT;

  let serviceAgentModel: AgentDocument | null = null;
  if (config.serviceAgent) {
    serviceAgentModel = await agentRepository.getById(config.serviceAgent.toString());
  }

  if (serviceAgentModel) {
    serviceAgent = await configureServiceAgent(serviceAgentModel);

    const agentResponse: string = await serviceAgent.startAgent();

    const chat: SimulationDocument = await chatRepository.create(simulation);

    const usedEndpoints: string[] = [];

    const newMessage: MessageDocument = await createMessageDocument(
      serviceAgent.messageHistory[count++],
      agentResponse,
      usedEndpoints,
    );
    await chatRepository.send(chat._id, newMessage);

    return chat;
  }

  throw new Error('Service agent not found!');
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
  if (!serviceAgent) {
    throw new Error('Service agent not found!');
  }
  const usedEndpoints: string[] = [];

  const agentResponse: string = await forwardMessageToAgentAndWaitResponse(message);

  const userMessage: MessageDocument = await createMessageDocument(
    serviceAgent.messageHistory[count++],
    message,
    usedEndpoints,
  );
  await chatRepository.send(chatId, userMessage);

  const agentMessage: MessageDocument = await createMessageDocument(
    serviceAgent.messageHistory[count++],
    agentResponse,
    usedEndpoints,
  );
  await chatRepository.send(chatId, agentMessage);

  return agentResponse;
}

async function forwardMessageToAgentAndWaitResponse(message: string): Promise<string> {
  if (!serviceAgent) {
    throw new Error('Service agent not found!');
  }
  const agentResponse = await serviceAgent.processHumanInput(message);
  return agentResponse;
}

/**
 * Load an old chat with a given id
 * @param id - Simulation id
 * @returns A promise that resolves to the chat simulation object.
 */
async function load(chatId: string): Promise<ChatMessage[]> {
  setupPath();

  const messages: ChatMessage[] = [];

  const [agentId, msgHistory] = await chatRepository.loadChat(chatId);

  let serviceAgentModel: AgentDocument | null = null;
  if (agentId) {
    serviceAgentModel = await agentRepository.getById(agentId.toString());
  }

  if (serviceAgentModel) {
    serviceAgent = await configureServiceAgent(serviceAgentModel, msgHistory);
    console.log('Agent configs: ', serviceAgent);

    for (let i = 0; i < serviceAgent.messageHistory.length; i++) {
      if (serviceAgent.messageHistory[i].type === MsgTypes.HUMANINPUT) {
        const userInput = serviceAgent.messageHistory[i].userInput;
        if (userInput !== null) {
          messages.push({ sender: MsgSender.USER, text: userInput });
        }
      }

      const intermediateMsg = serviceAgent.messageHistory[i].intermediateMsg;
      if (intermediateMsg !== null) {
        messages.push({ sender: MsgSender.AGENT, text: intermediateMsg });
      }

      const msgToUser = serviceAgent.messageHistory[i].msgToUser;
      if (msgToUser !== null) {
        messages.push({ sender: MsgSender.AGENT, text: msgToUser });
      }
    }

    count = serviceAgent.messageHistory.length;
  }

  return messages;
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
  load,
  update,
  del,
  getAll,
  sendMessage,
  end,
};
