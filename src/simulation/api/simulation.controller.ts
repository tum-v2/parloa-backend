// Controller that implements simulation related endpoints
import { Request, Response } from 'express';

import { RunSimulationRequest } from '../model/request/run-simulation.request';
import { SimulationDocument } from '../db/models/simulation.model';
import simulationService from '../service/simulation.service';
import { logger } from '../service/logging.service';
import { ConversationDocument } from '@simulation/db/models/conversation.model';

import { INTERNAL_SERVER_ERROR } from '../utils/errors';

/**
 * Runs the simulation.
 * @param req - Request object (RunSimulationRequest)
 * @param res - Response object (returns the created simulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function run(req: Request, res: Response): Promise<void> {
  try {
    const simulationConfig: RunSimulationRequest = req.body as RunSimulationRequest;
    const simulation: SimulationDocument = await simulationService.initiate(simulationConfig);
    res.status(201).send(simulation);
  } catch (error) {
    logger.error(`Simulation run failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Polls the current state of the simulation.
 * @param req - Request object
 * @param res - Response object (returns the fetched simulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function poll(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const simulation: SimulationDocument | null = await simulationService.poll(id);
    if (simulation) {
      res.status(200).send(simulation);
    } else {
      res.status(404).send({ error: `Simulation ${id} not found!` });
    }
  } catch (error) {
    logger.error(`Simulation poll failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets the conversations of the simulation.
 * @param req - Request object
 * @param res - Response object (returns the conversations of the simulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function getConversations(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const conversations: ConversationDocument[] = await simulationService.getConversations(id);
    res.status(200).send(conversations);
  } catch (error) {
    logger.error(`Simulation fetch conversations failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets the conversations of the simulation.
 * @param req - Request object
 * @param res - Response object (returns all simulations)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function getAll(req: Request, res: Response): Promise<void> {
  try {
    // TODO Apply filters if needed
    const simulations: SimulationDocument[] = await simulationService.getAll();
    res.status(200).send(simulations);
  } catch (error) {
    logger.error(`All simulations fetch failed! ${error}`);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Updates the simulation attributes.
 * @param req - Request object (includes changed attributes)
 * @param res - Response object
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function update(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const updates: Partial<SimulationDocument> = req.body as Partial<SimulationDocument>;
    const updated: SimulationDocument | null = await simulationService.update(id, updates);
    if (updated) {
      res.status(200).send(updated);
    } else {
      res.status(404).send({ error: `Simulation ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Deletes the simulation.
 * @param req - Request object
 * @param res - Response object
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function del(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const success: boolean = await simulationService.del(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: `Simulation ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  run,
  poll,
  getConversations,
  getAll,
  update,
  del,
};
