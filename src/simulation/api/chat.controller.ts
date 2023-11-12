// Controller that implements chat related endpoints
import AgentConfig from '../model/agent-config.model';
import { Request, Response } from 'express';

//TODO import chatService from '../service/chat.service';

async function startChat(req: Request, res: Response) {
  const agentConfig: AgentConfig = req.body;
  console.log(agentConfig);

  console.log('Starting chat...');
  // TODO Start Chat

  res.send(200);
}

async function sendMessage(req: Request, res: Response) {
  console.log('Message received from user...');
  const message: string = req.body.message;
  console.log(message);

  console.log('Sending message...');
  // TODO Forward message to agent

  res.send(200);
}

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
