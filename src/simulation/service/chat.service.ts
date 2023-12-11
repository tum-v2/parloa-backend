import repositoryFactory from '@db/repositories/factory';
import { AgentDocument } from '@db/models/agent.model';
import { MessageDocument } from '@db/models/message.model';
import { SimulationDocument, SimulationModel } from '@db/models/simulation.model';

import { SimulationType } from '@enums/simulation-type.enum';
import { SimulationStatus } from '@enums/simulation-status.enum';
import { MsgType } from '@enums/msg-type.enum';
import { MsgSender } from '@enums/msg-sender.enum';

import { CustomAgent } from '@simulation/agents/custom.agent';
import { configureServiceAgent, createMessageDocument, setupPath } from '@simulation/service/conversation.service';
import ChatMessage from '@simulation/model/response/chat.response';
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

  count = 0;

  const simulation: SimulationDocument = new SimulationModel();

  simulation.name = config.name;
  simulation.status = SimulationStatus.RUNNING;
  simulation.type = SimulationType.CHAT;

  let serviceAgentModel: AgentDocument | null = null;
  if (config.agentConfig !== undefined) {
    config.agentConfig.temporary = true;
    serviceAgentModel = await agentRepository.create(config.agentConfig!);
  } else if (config.agentId !== undefined) {
    serviceAgentModel = await agentRepository.getById(config.agentId!.toString());
  }

  if (serviceAgentModel === null) {
    throw new Error('Agent id not found');
  }

  simulation.serviceAgent = serviceAgentModel;

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
 * Send a message to service agent
 * @param chatId - Chat id
 * @param message - Message
 * @returns A promise that resolves to the message response of service agents.
 */
async function sendMessage(chatId: string, message: string): Promise<ChatMessage> {
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

  let agentMessage: MessageDocument = {} as MessageDocument;
  while (count < serviceAgent.messageHistory.length) {
    agentMessage = await createMessageDocument(serviceAgent.messageHistory[count++], agentResponse, usedEndpoints);
    await chatRepository.send(chatId, agentMessage);
  }

  const response: ChatMessage = {
    sender: agentMessage.sender,
    text: agentMessage.msgToUser ? agentMessage.msgToUser : '',
    timestamp: agentMessage.timestamp,
    userCanReply: true,
  };

  return response;
}

/**
 * Forward a message to the service agent and wait for the response.
 * @param message - The message to be forwarded.
 * @returns A promise that resolves to the response from the service agent.
 */
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
      if (serviceAgent.messageHistory[i].type === MsgType.HUMANINPUT) {
        const userInput = serviceAgent.messageHistory[i].userInput;
        const timestamp = serviceAgent.messageHistory[i].timestamp;
        if (userInput !== null) {
          messages.push({ sender: MsgSender.USER, text: userInput, timestamp: timestamp, userCanReply: true });
        }
      }

      const msgToUser = serviceAgent.messageHistory[i].msgToUser;
      const timestamp = serviceAgent.messageHistory[i].timestamp;
      if (msgToUser !== null) {
        messages.push({ sender: MsgSender.AGENT, text: msgToUser, timestamp: timestamp, userCanReply: true });
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

export default {
  start,
  load,
  getAll,
  sendMessage,
};
