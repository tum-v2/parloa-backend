import { Request, Response } from 'express';
import agentService from '@simulation/service/agent.service';
import { AgentDocument } from '@simulation/db/models/agent.model';
import { INTERNAL_SERVER_ERROR } from '@simulation/utils/errors';

/**
 * Creates a new agent.
 * @param req - Request object (AgentDocument)
 * @param res - Response object (returns the created agent)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function create(req: Request, res: Response): Promise<void> {
  try {
    const newAgent: AgentDocument = await agentService.create(req.body as AgentDocument);
    res.status(201).send(newAgent);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets an agent by id.
 * @param req - Request object
 * @param res - Response object (returns the fetched agent)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function get(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const agent: AgentDocument | null = await agentService.getById(id);

    if (agent) {
      res.status(200).send(agent);
    } else {
      res.status(404).send({ error: `Agent ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Updates an agent by id.
 * @param req - Request object (AgentDocument)
 * @param res - Response object (returns the updated agent)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function update(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const updates: Partial<AgentDocument> = req.body as Partial<AgentDocument>;
    const updatedAgent: AgentDocument | null = await agentService.update(id, updates);

    if (updatedAgent) {
      res.status(200).send(updatedAgent);
    } else {
      res.status(404).send({ error: `Agent ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Deletes an agent by id.
 * @param req - Request object
 * @param res - Response object
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function del(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const success: boolean = await agentService.del(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: `Agent ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets all agents.
 * @param req - Request object
 * @param res - Response object (returns all agents)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const agents: AgentDocument[] = await agentService.getAll();
    res.status(200).send(agents);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  create,
  get,
  update,
  del,
  getAll,
};
