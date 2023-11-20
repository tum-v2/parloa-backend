import { Request, Response } from 'express';
import agentService from '../service/agent.service';
import { AgentDocument } from '@simulation/db/models/agent.model';

async function createAgent(req: Request, res: Response): Promise<void> {
  try {
    const newAgent = await agentService.create(req.body as AgentDocument);
    res.status(201).send(newAgent);
  } catch (error) {
    res.status(500).send({ error: error });
  }
}

async function getAgent(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const agent = await agentService.getById(id);
    if (agent) {
      res.status(200).send(agent);
    }
    res.status(404).send({ error: `Agent ${id} not found!` });
  } catch (error) {
    res.status(500).send({ error: error });
  }
}

async function updateAgent(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const updates: Partial<AgentDocument> = req.body as Partial<AgentDocument>;
    const updatedAgent = await agentService.update(id, updates);
    if (updatedAgent) {
      res.status(200).send(updatedAgent);
    } else {
      res.status(404).send({ error: `Agent ${id} not found!` });
    }
  } catch (error) {
    res.status(500).send({ error: error });
  }
}

async function deleteAgent(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const success = await agentService.del(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: `Agent ${id} not found!` });
    }
  } catch (error) {
    res.status(500).send({ error: error });
  }
}

export default {
  createAgent,
  getAgent,
  updateAgent,
  deleteAgent,
};
