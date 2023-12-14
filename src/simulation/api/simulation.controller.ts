import { Request, Response } from 'express';

import { RunABTestingRequest } from '@simulation/model/request/ab-testing.request';
import { RunSimulationRequest } from '@simulation/model/request/simulation.request';
import simulationService from '@simulation/service/simulation.service';

import { SimulationDocument } from '@db/models/simulation.model';
import { ConversationDocument } from '@db/models/conversation.model';

import { logger } from '@utils/logger';
import { INTERNAL_SERVER_ERROR } from '@utils/errors';

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
 * Runs the simulation.
 * @param req - Request object (RunSimulationRequest)
 * @param res - Response object (returns the created simulations)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function runABTesting(req: Request, res: Response): Promise<void> {
  try {
    const simulationConfig: RunABTestingRequest = req.body as RunABTestingRequest;
    const simulations: SimulationDocument[] = await simulationService.initiateAB(simulationConfig);
    res.status(201).send(simulations);
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
 * @param res - Response object (returns all simulations)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const simulations: SimulationDocument[] = await simulationService.getAll();
    res.status(200).send(simulations);
  } catch (error) {
    logger.error(`All simulations fetch failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets the conversation of the simulation.
 * @param req - Request object
 * @param res - Response object (returns the conversation of the simulation)
 */
async function getConversation(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const conversation: ConversationDocument | null = await simulationService.getConversation(id);
    if (conversation) {
      res.status(200).send(conversation);
    } else {
      res.status(404).send({ error: `Conversation ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
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
  runABTesting,
  poll,
  getAll,
  getConversation,
  update,
  del,
};
