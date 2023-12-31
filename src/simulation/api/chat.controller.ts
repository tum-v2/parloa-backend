import { Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR } from '@utils/errors';
import { SimulationDocument } from '@db/models/simulation.model';
import chatService from '@simulation/service/chat.service';
import simulationService from '@simulation/service/simulation.service';
import ChatMessage from '@simulation/model/response/chat.response';
import { StartChatRequest } from '@simulation/model/request/chat.request';

/**
 * Starts the chat (manual simulation)
 * @param req - Request object - TBD
 * @param res - Response object - TBD
 */
async function start(req: Request, res: Response): Promise<void> {
  try {
    const config: StartChatRequest = req.body as StartChatRequest;
    console.log(config);

    console.log('Starting chat...');
    const chat: SimulationDocument = await chatService.start(config);

    res.status(200).send(chat);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Starts the chat (manual simulation)
 * @param req - Request object - TBD
 * @param res - Response object - TBD
 */
async function load(req: Request, res: Response): Promise<void> {
  try {
    const chatId: string = req.params.id;
    console.log(chatId);

    const chat: SimulationDocument | null = await simulationService.poll(chatId);
    if (chat) {
      console.log('Loading chat...');
      const { messages } = await chatService.load(chatId);
      res.status(200).send(messages);
    } else {
      res.status(404).send({ error: `Chat ${chatId} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Sends a message from client to the agent
 * @param req - Request object - TBD
 * @param res - Response object - TBD
 */
async function sendMessage(req: Request, res: Response): Promise<void> {
  try {
    console.log('Message received from user...');
    const chatId: string = req.params.id;
    const message: string = req.body.message;
    console.log(message);

    const chat: SimulationDocument | null = await simulationService.poll(chatId);
    if (chat) {
      console.log('Sending message...');
      const chatAgentResponse: ChatMessage = await chatService.sendMessage(chatId, message);
      res.status(200).send(chatAgentResponse);
    } else {
      res.status(404).send({ error: `Chat ${chatId} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets all chats
 * @param req - Request object
 * @param res - Response object
 */
async function getAll(req: Request, res: Response): Promise<void> {
  try {
    console.log('Getting all chats...');
    const chats: SimulationDocument[] = await chatService.getAll();

    res.status(200).send(chats);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  start,
  load,
  sendMessage,
  getAll,
};
