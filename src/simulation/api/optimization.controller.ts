// Controller that implements simulation related endpoints
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { RunSimulationRequest } from '../model/request/simulation.request';
import optimizationService from '../service/optimization.service';
import { logger } from '../service/logging.service';

import { INTERNAL_SERVER_ERROR } from '../utils/errors';
import { OptimizationDocument } from '../db/models/optimization.model';
import { SimulationDocument } from '@simulation/db/models/simulation.model';

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

    logger.info(req.body);
    const simulationConfig: RunSimulationRequest = req.body as RunSimulationRequest;
    const optimization: OptimizationDocument = await optimizationService.initiate(simulationConfig);

    res.status(201).send(optimization);
  } catch (error) {
    logger.error(`Optimization run failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Handle requests coming from the UI, get child simulations that belong to an optimized simulation
 * @param req - Request object
 * @param res - Response object (returns the fetched simulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function get(req: Request, res: Response): Promise<void> {
  try {
    const optimization: string = req.params.id;
    const simulations: SimulationDocument[] | null = await optimizationService.getSimulations(optimization);

    res.status(200).send(simulations);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  run,
  get,
};
