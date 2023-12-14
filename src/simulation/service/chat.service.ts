import repositoryFactory from '@db/repositories/factory';
import { AgentDocument } from '@db/models/agent.model';
import { MessageDocument } from '@db/models/message.model';
import { SimulationDocument, SimulationModel } from '@db/models/simulation.model';

import { SimulationType } from '@enums/simulation-type.enum';
import { SimulationStatus } from '@enums/simulation-status.enum';
import { MsgType } from '@enums/msg-type.enum';
import { MsgSender } from '@enums/msg-sender.enum';

import { createMessageDocument } from '@simulation/service/conversation.service';
import ChatMessage from '@simulation/model/response/chat.response';
import { StartChatRequest } from '@simulation/model/request/chat.request';
import AgentManager from '@simulation/service/agent.manager.service';

const agentRepository = repositoryFactory.agentRepository;
const chatRepository = repositoryFactory.chatRepository;

// Create a new AgentManager instance to manage multiple agents for different chats
const agentManager = new AgentManager();

/**
 * Start a chat with the service agent
 * @param config - Chat configuration
 * @returns A promise that resolves to the chat simulation object.
 */
async function start(config: StartChatRequest): Promise<SimulationDocument> {
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
    let chat: SimulationDocument = await chatRepository.create(simulation);

    const usedEndpoints: string[] = [];

    // Create a new agent for the chat
    await agentManager.createAgent(chat._id.toString(), serviceAgentModel);

    // Retrieve the current agent and start the conversation
    const agent = agentManager.getCurrentAgent(chat._id.toString());
    if (agent) {
      const agentResponse: string = await agent.startAgent();

      const messageCount = agentManager.getMessageCountForCurrentAgent(chat._id.toString());

      const newMessage: MessageDocument = await createMessageDocument(
        agent.messageHistory[messageCount],
        usedEndpoints,
        agentResponse,
      );
      chat = await chatRepository.send(chat._id, newMessage);

      agentManager.incrementMessageCountForCurrentAgent(chat._id.toString());
    } else {
      console.error('No current agent available.');
    }
    return chat;
  }
  throw new Error('Agent not found!');
}

/**
 * Send a message to service agent
 * @param chatId - Chat id
 * @param message - Message
 * @returns A promise that resolves to the message response of service agents.
 */
async function sendMessage(chatId: string, message: string): Promise<ChatMessage> {
  const usedEndpoints: string[] = [];

  // Set the current agent for processing the message
  const agent = agentManager.getAgentByConversation(chatId);

  if (agent) {
    const agentResponse = await agent.processHumanInput(message);

    let messageCount = agentManager.getMessageCountForCurrentAgent(chatId);
    const userMessage: MessageDocument = await createMessageDocument(
      agent.messageHistory[messageCount],
      usedEndpoints,
      message,
    );
    await chatRepository.send(chatId, userMessage);
    agentManager.incrementMessageCountForCurrentAgent(chatId);

    let agentMessage: MessageDocument = {} as MessageDocument;
    messageCount = agentManager.getMessageCountForCurrentAgent(chatId);
    while (messageCount < agent.messageHistory.length) {
      agentMessage = await createMessageDocument(agent.messageHistory[messageCount], usedEndpoints, agentResponse);
      await chatRepository.send(chatId, agentMessage);
      agentManager.incrementMessageCountForCurrentAgent(chatId);
      messageCount = agentManager.getMessageCountForCurrentAgent(chatId);
    }

    const response: ChatMessage = {
      sender: agentMessage.sender,
      // text: agentMessage.msgToUser ? agentMessage.msgToUser : '',
      text: agentMessage.msgToUser ?? agentMessage.intermediateMsg ?? '',
      timestamp: agentMessage.timestamp,
      userCanReply: true,
    };

    return response;
  } else {
    throw new Error('Agent not found in available agents!');
  }
}

/**
 * Load an old chat with a given id
 * @param id - Simulation id
 * @returns A promise that resolves to the chat simulation object.
 */
async function load(chatId: string): Promise<ChatMessage[]> {
  const messages: ChatMessage[] = [];

  const [agentId, msgHistory] = await chatRepository.loadChat(chatId);

  let serviceAgentModel: AgentDocument | null = null;
  if (agentId) {
    serviceAgentModel = await agentRepository.getById(agentId.toString());
  }

  if (serviceAgentModel) {
    // Create a new agent for the loaded chat and associate it with the current simulation
    await agentManager.createAgent(chatId, serviceAgentModel, msgHistory);

    // Retrieve the current agent and load the chat history
    const agent = agentManager.getCurrentAgent(chatId);
    if (agent) {
      for (let i = 0; i < agent.messageHistory.length; i++) {
        if (agent.messageHistory[i].type === MsgType.HUMANINPUT) {
          const userInput = agent.messageHistory[i].userInput;
          const timestamp = agent.messageHistory[i].timestamp;
          if (userInput !== null) {
            messages.push({
              sender: MsgSender.USER,
              text: userInput,
              timestamp: timestamp,
              userCanReply: false,
            });
          }
        }

        const msgToUser = agent.messageHistory[i].msgToUser;
        const timestamp = agent.messageHistory[i].timestamp;
        if (msgToUser !== null) {
          messages.push({
            sender: MsgSender.AGENT,
            text: msgToUser,
            timestamp: timestamp,
            userCanReply: true,
          });
        }
      }
    } else {
      console.error('No current agent available.');
    }
    agentManager.loadMessageCountForCurrentAgent(chatId);
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
