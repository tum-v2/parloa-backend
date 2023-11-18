// Controller that implements simulation related endpoints
import { Request, Response } from 'express';

import { RunSimulationRequest } from '../model/request/run-simulation.request';
import { SimulationDocument } from '../db/models/simulation.model';
import simulationService from '../service/simulation.service';
import { Types } from 'mongoose';
import { logger } from '../service/logging.service';
import { UpdateSimulationRequest } from '@simulation/model/request/update-simulation.request';

/**
 * Runs the simulation.
 * @param {Request} req - Request object (RunSimulationRequest)
 * @param {Response} res - Response object (returns the created simulation)
 * @throws {Error} Throws an internal server error if there is an issue with the operation.
 */
async function run(req: Request, res: Response) {
  try {
    const simulationConfig: RunSimulationRequest = req.body as RunSimulationRequest;
    const simulation: SimulationDocument = await simulationService.initiate(simulationConfig);
    res.status(201).send(simulation);
  } catch (error) {
    logger.error(`Simulation run failed! ${error}`);
    res.status(400).send({ error: error });
  }
}

/**
 * Polls the current state of the simulation.
 * @param {Request} req - Request object
 * @param {Response} res - Response object (returns the fetched simulation)
 * @throws {Error} Throws an internal server error if there is an issue with the operation.
 */
async function poll(req: Request, res: Response) {
  try {
    const simulationId: Types.ObjectId = new Types.ObjectId(req.params.id);
    const simulation = await simulationService.poll(simulationId);
    res.status(200).send(simulation);
  } catch (error) {
    logger.error(`Simulation poll failed! ${error}`);
    res.status(400).send({ error: error });
  }
}

/**
 * Gets details of the simulation.
 * @param {Request} req - Request object
 * @param {Response} res - Response object (returns the fetched simulation)
 * @throws {Error} Throws an internal server error if there is an issue with the operation.
 */
async function getDetails(req: Request, res: Response) {
  try {
    const simulationId: Types.ObjectId = new Types.ObjectId(req.params.id);
    const simulation = await simulationService.getDetails(simulationId);
    res.status(200).send(simulation);
  } catch (error) {
    logger.error(`Simulation fetch details failed! ${error}`);
    res.status(400).send({ error: error });
  }
}

/**
 * Gets the conversations of the simulation.
 * @param {Request} req - Request object
 * @param {Response} res - Response object (returns the conversations of the simulation)
 * @throws {Error} Throws an internal server error if there is an issue with the operation.
 */
async function getConversations(req: Request, res: Response) {
  try {
    const simulationId: Types.ObjectId = new Types.ObjectId(req.params.id);
    const conversations = await simulationService.getConversations(simulationId);
    res.status(200).send(conversations);
  } catch (error) {
    logger.error(`Simulation fetch conversations failed! ${error}`);
    res.status(400).send({ error: error });
  }
}

/**
 * Gets the conversations of the simulation.
 * @param {Request} req - Request object
 * @param {Response} res - Response object (returns all simulations)
 * @throws {Error} Throws an internal server error if there is an issue with the operation.
 */
async function getAll(req: Request, res: Response) {
  try {
    // TODO Apply filters if needed
    const simulations = await simulationService.getAll();
    res.status(200).send(simulations);
  } catch (error) {
    logger.error(`All simulations fetch failed! ${error}`);
    res.status(400).send({ error: error });
  }
}

/**
 * Updates the simulation attributes.
 * @param {Request} req - Request object (includes changed attributes)
 * @param {Response} res - Response object
 * @throws {Error} Throws an internal server error if there is an issue with the operation.
 */
async function update(req: Request, res: Response) {
  try {
    const simulationId: Types.ObjectId = new Types.ObjectId(req.params.id);
    const updates: UpdateSimulationRequest = req.body as UpdateSimulationRequest;
    const response = await simulationService.update(simulationId, updates);
    console.log(response);
    res.status(response.success ? 200 : 400).send(response);
  } catch (error) {
    logger.error(`Update simulation failed! ${error}`);
    res.status(400).send({ error: error });
  }
}

/**
 * Deletes the simulation.
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @throws {Error} Throws an internal server error if there is an issue with the operation.
 */
async function del(req: Request, res: Response) {
  try {
    const simulationId: Types.ObjectId = new Types.ObjectId(req.params.id);
    const success = await simulationService.del(simulationId);
    res.status(success ? 204 : 400).send({ success: success });
  } catch (error) {
    logger.error(`Delete simulation failed! ${error}`);
    res.status(400).send({ error: error });
  }
}

export default {
  run,
  poll,
  getDetails,
  getConversations,
  getAll,
  update,
  del,
};
