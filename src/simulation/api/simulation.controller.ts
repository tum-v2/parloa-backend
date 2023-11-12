// Controller that implements simulation related endpoints
import SimulationConfig from '../model/simulation-config.model';
import Simulation from '../model/simulation';
import { Request, Response } from 'express';

import simulationService from '../service/simulation.service';

async function runSimulation(req: Request, res: Response) {
  const simulationConfig: SimulationConfig = req.body;
  console.log(simulationConfig);
  const simulation: Simulation = await simulationService.initSimulation(simulationConfig);
  res.send(simulation);
}

async function pollSimulation(req: Request, res: Response) {
  const simulationId: string = req.params.id;
  const simulation = await simulationService.pollSimulation(simulationId);
  res.send(simulation);
}

async function getSimulationDetails(req: Request, res: Response) {
  const simulationId: string = req.params.id;
  const simulation = await simulationService.getSimulationDetails(simulationId);
  res.send(simulation);
}

export default {
  runSimulation,
  pollSimulation,
  getSimulationDetails,
};
