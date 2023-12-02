import { SimulationDocument } from '../db/models/simulation.model';
import { ConversationDocument } from '../db/models/conversation.model';
import { RunSimulationRequest } from '../model/request/run-simulation.request';
import { SimulationStatus } from '../db/enum/enums';
import { Types } from 'mongoose';

import repositoryFactory from '../db/repositories/factory';
import { AgentDocument } from '../db/models/agent.model';
import { runConversation } from './conversation.service';

const agentRepository = repositoryFactory.agentRepository;
const simulationRepository = repositoryFactory.simulationRepository;

/**
 * Creates a simulation object and initiates the simulation.
 * @param request - The simulation configuration.
 * @returns A promise that resolves to the simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function initiate(
  request: RunSimulationRequest,
  optimization: string | null = null,
  child: boolean = false,
): Promise<SimulationDocument> {
  console.log('Simulation initiated...');
  console.log('Configuration:', request);

  let userAgent: AgentDocument | null = null;
  let serviceAgent: AgentDocument | null = null;
  console.log('Creating simulation object...');
  if (request.serviceAgentConfig !== undefined && request.userAgentConfig !== undefined) {
    userAgent = await agentRepository.create(request.userAgentConfig!);
    serviceAgent = await agentRepository.create(request.serviceAgentConfig!);
  } else if (request.serviceAgentId !== undefined && request.userAgentId !== undefined) {
    userAgent = await agentRepository.getById(request.userAgentId!);
    serviceAgent = await agentRepository.getById(request.serviceAgentId!);
  }

  if (userAgent === null || serviceAgent === null) {
    throw new Error('User agent or service agent id not found');
  }

  const simulationData: Partial<SimulationDocument> = {
    scenario: request.scenario,
    type: request.type,
    name: request.name,
    userAgent: userAgent,
    serviceAgent: serviceAgent,
    numConversations: request.numConversations,
    conversations: [],
    status: SimulationStatus.SCHEDULED,
  };

  if (!child && optimization !== null) {
    simulationData.optimization = optimization;
  }

  const simulation = await simulationRepository.create(simulationData);
  console.log(simulation);

  run(simulation, request, serviceAgent, userAgent, optimization);

  return simulation;
}

/**
 * Run the simulation.
 */
async function run(
  simulation: SimulationDocument,
  request: RunSimulationRequest,
  serviceAgent: AgentDocument,
  userAgent: AgentDocument,
  optimization: string | null,
) {
  const conversations: Types.ObjectId[] = [];

  const numConversations = request.numConversations;
  if (numConversations <= 0 || numConversations > 2) {
    throw new Error(
      'Number of conversations must be between 1 and 2 (just for now so nobody miss clicks and runs 100 conversations which would cost a lot of money))',
    );
  }
  simulation.status = SimulationStatus.RUNNING;
  await simulationRepository.updateById(simulation._id, simulation);
  for (let i = 0; i < numConversations; i++) {
    const conversation: any = await runConversation(serviceAgent, userAgent);
    conversations.push(conversation);
    simulation.conversations = conversations;
    await simulationRepository.updateById(simulation._id, simulation);
    if (i === numConversations - 1) {
      // wait for evaluation function
    } else {
      // trigger evaluation function
      if (optimization !== null) {
        // call optimization function
      }
    }
  }

  simulation.status = SimulationStatus.FINISHED;
  await simulationRepository.updateById(simulation._id, simulation);
}

//

/**
 * Retrieves a simulation object with populated agent, and conversation fields.
 * @param id - The ID of the simulation object to retrieve.
 * @returns A promise that resolves to the simulation object with populated references, or null if not found.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function poll(id: string): Promise<SimulationDocument | null> {
  return simulationRepository.findById(id);
}

/**
 * Retrieves conversations in a simulation object.
 * @param id - The ID of the simulation object to retrieve.
 * @returns A promise that resolves to the conversation object list.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function getConversations(id: string): Promise<ConversationDocument[] | null> {
  return await simulationRepository.getConversationsById(id);
}

/**
 * Fetches all simulations.
 * @returns A promise that resolves to simulation object list.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function getAll(): Promise<SimulationDocument[]> {
  const simulations: SimulationDocument[] = await simulationRepository.findAllParentSimulations();
  return simulations;
}

/**
 * Updates the simulation object.
 * @param id - The ID of the simulation object to update.
 * @param updates - The updates to apply to the simulation object.
 * @returns A promise that resolves to the updated simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function update(id: string, updates: Partial<SimulationDocument>): Promise<SimulationDocument | null> {
  return await simulationRepository.updateById(id, updates);
}

/**
 * Deletes the simulation object.
 * @param id - The ID of the simulation object to update.
 * @returns A promise that resolves to the updated simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function del(id: string): Promise<boolean> {
  return await simulationRepository.deleteById(id);
}

export default {
  initiate,
  poll,
  getConversations,
  getAll,
  update,
  del,
};
