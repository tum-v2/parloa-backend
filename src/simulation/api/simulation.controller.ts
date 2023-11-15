// Controller that implements simulation related endpoints
import { Request, Response } from 'express';

import { RunSimulationRequest } from '../model/request/run-simulation.request';
import { SimulationDocument } from '../db/models/simulation.model';
import simulationService from '../service/simulation.service';
import { Types } from 'mongoose';
import { logger } from '../service/logging-service';

/**
 * Runs the simulation.
 * @param {Request} req - Request object (RunSimulationRequest)
 * @param {Response} res - Response object (returns the created simulation)
 * @throws {Error} Throws an internal server error if there is an issue with the operation.
 */
async function run(req: Request, res: Response) {
  try {
    const simulationConfig = req.body as RunSimulationRequest;
    const simulation: SimulationDocument = await simulationService.initiate(simulationConfig);
    res.status(201).send(simulation);
  } catch (error) {
    logger.error(`Simulation run failed! ${error}`);
    res.status(500).send({ error: error });
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
    res.status(500).send({ error: error });
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
    res.status(500).send({ error: error });
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
    res.status(500).send({ error: error });
  }
}

export default {
  run,
  poll,
  getDetails,
  getConversations,
};
