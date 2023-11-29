// Controller that implements simulation related endpoints
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { RunSimulationRequest } from '../model/request/run-simulation.request';
import optimizationService from '../service/optimization.service';
import { logger } from '../service/logging.service';

import { INTERNAL_SERVER_ERROR } from '../utils/errors';
import { OptimizationDocument } from '../db/models/optimization.model';

/**
 * Handle requests coming from the UI, start the optimization process.
 * @param req - Request object (RunSimulationRequest)
 * @param res - Response object (returns the created simulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function run(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: errors });
      return;
    }

    const simulationConfig: RunSimulationRequest = req.body as RunSimulationRequest;
    const optimization: OptimizationDocument = await optimizationService.initiate(simulationConfig);

    res.status(201).send(optimization);
  } catch (error) {
    logger.error(`Optimization run failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Handles POST request from Evaluation, receive the ID of the finished simulation.
 * @param req - Request from evaluation team
 * @param res - Response
 */
async function done(req: Request, res: Response): Promise<void> {
  try {
    //Implement the evaluation logic here
  } catch (error) {
    logger.error(`Problems when receiving the simulation ID! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  run,
  done,
};
