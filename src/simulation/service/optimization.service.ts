import { SimulationDocument } from '../db/models/simulation.model';
import { RunSimulationRequest } from '../model/request/run-simulation.request';
import simulationService from './simulation.service';
import repositoryFactory from '../db/repositories/factory';
import { AgentDocument } from '../db/models/agent.model';
import agentService from './agent.service';

const NUMBER_OF_PROMPTS: number = 4;

const agentRepository = repositoryFactory.agentRepository;

/**
 * Creates a simulation object and initiates the simulation.
 * @param request - The simulation configuration.
 * @returns A promise that resolves to the simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function initiate(request: RunSimulationRequest): Promise<OptimizationDocument> {
  console.log('Optimization initiated...');

  const serviceAgent: AgentDocument | null = await agentRepository.getById(request.serviceAgentConfig);

  if (serviceAgent === null) {
    throw new Error('Service agent id not found');
  }
  
  const prompt: string = serviceAgent.prompt;
  console.log(prompt);

  const simulation: SimulationDocument = await simulationService.initiate(request);
  const requests: RunSimulationRequest[] = [];

  for (let i = 0; i < NUMBER_OF_PROMPTS; i++) {
    const agent: AgentDocument = await agentService.create({ prompt: prompt });
    requests.push(new RunSimulationRequest(request.scenario, request.type, request.name, request.numConversations, agent._id, request.userAgentConfig));
  }

  

  return simulation;
}

export default {
  initiate
};