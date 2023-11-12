// Controller that implements simulation related endpoints
import SimulationConfig from '../model/simulation-config.model';
import Simulation from '../model/simulation';
import { Request, Response } from 'express';

import simulationService from '../service/simulation.service';

async function run(req: Request, res: Response) {
  const simulationConfig: SimulationConfig = req.body;
  console.log(simulationConfig);
  const simulation: Simulation = await simulationService.initiate(simulationConfig);
  res.send(simulation);
}

async function poll(req: Request, res: Response) {
  const simulationId: string = req.params.id;
  const simulation = await simulationService.poll(simulationId);
  res.send(simulation);
}

async function getDetails(req: Request, res: Response) {
  const simulationId: string = req.params.id;
  const simulation = await simulationService.getDetails(simulationId);
  res.send(simulation);
}

async function getConversations(req: Request, res: Response) {
  const simulationId: string = req.params.id;
  const conversations = await simulationService.getConversations(simulationId);
  res.send(conversations);
}

export default {
  run,
  poll,
  getDetails,
  getConversations,
};
