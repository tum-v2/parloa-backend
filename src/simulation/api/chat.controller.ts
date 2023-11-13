// Controller that implements chat related endpoints
import { Request, Response } from 'express';
import { AgentDocument } from '../db/models/agent.model';

//TODO import chatService from '../service/chat.service';

/**
 * Starts the chat (manual simulation)
 * @param {Request} req - Request object - TBD
 * @param {Response} res - Response object - TBD
 */
async function startChat(req: Request, res: Response) {
  const agentConfig: AgentDocument = req.body;
  console.log(agentConfig);

  console.log('Starting chat...');
  // TODO Start Chat

  res.send(200);
}

/**
 * Sends a message from client to the agent
 * @param {Request} req - Request object - TBD
 * @param {Response} res - Response object - TBD
 */
async function sendMessage(req: Request, res: Response) {
  console.log('Message received from user...');
  const message: string = req.body.message;
  console.log(message);

  console.log('Sending message...');
  // TODO Forward message to agent

  res.send(200);
}

/**
 * Ends the chat
 * @param {Request} req - Request object - TBD
 * @param {Response} res - Response object - TBD
 */
async function endChat(req: Request, res: Response) {
  console.log('Ending chat...');
  // TODO End Chat

  res.send(200);
}

export default {
  startChat,
  sendMessage,
  endChat,
};
