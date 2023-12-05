// Controller that implements chat related endpoints
import { Request, Response } from 'express';
import { SimulationDocument } from '../db/models/simulation.model';

import chatService from '../service/chat.service';
import { INTERNAL_SERVER_ERROR } from '../utils/errors';
import ChatMessage from '../model/response/chat.response';
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

    const chat: SimulationDocument | null = await chatService.getById(chatId);
    if (chat) {
      console.log('Loading chat...');
      const messages: ChatMessage[] = await chatService.load(chatId);
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

    const chat: SimulationDocument | null = await chatService.getById(chatId);
    if (chat) {
      console.log('Sending message...');
      const simulationWithAgentResponse: string = await chatService.sendMessage(chatId, message);
      res.status(200).send({ message: simulationWithAgentResponse });
    } else {
      res.status(404).send({ error: `Chat ${chatId} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets the chat by id
 * @param req - Request object
 * @param res - Response object
 */
async function get(req: Request, res: Response): Promise<void> {
  try {
    console.log('Getting chat...');
    const id: string = req.params.id;
    console.log(id);
    const chat: SimulationDocument | null = await chatService.getById(id);
    if (chat) {
      res.status(200).send(chat);
    } else {
      res.status(404).send({ error: `Chat ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Ends the chat
 * @param req - Request object - TBD
 * @param res - Response object - TBD
 */
async function end(req: Request, res: Response): Promise<void> {
  try {
    console.log('Ending chat...');
    const id: string = req.params.id;
    console.log(id);
    const chat: SimulationDocument | null = await chatService.end(id);
    if (chat) {
      res.status(200).send(chat);
    } else {
      res.status(404).send({ error: `Chat ${id} not found!` });
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

/**
 * Updates the chat
 * @param req - Request object
 * @param res - Response object
 */
async function update(req: Request, res: Response): Promise<void> {
  try {
    console.log('Updating chat...');
    const id: string = req.params.id;
    const updates: Partial<SimulationDocument> = req.body as Partial<SimulationDocument>;
    console.log(updates);
    const updatedChat: SimulationDocument | null = await chatService.update(id, updates);
    if (updatedChat) {
      res.status(200).send(updatedChat);
    } else {
      res.status(404).send({ error: `Chat ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Deletes the chat
 * @param req - Request object
 * @param res - Response object
 */
async function del(req: Request, res: Response): Promise<void> {
  try {
    console.log('Deleting chat...');
    const id: string = req.params.id;
    const success: boolean = await chatService.del(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: `Chat ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  start,
  load,
  sendMessage,
  get,
  end,
  getAll,
  update,
  del,
};
