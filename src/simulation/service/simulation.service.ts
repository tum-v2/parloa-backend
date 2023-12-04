import { SimulationDocument } from '../db/models/simulation.model';
import { ConversationDocument } from '../db/models/conversation.model';
import { RunSimulationRequest } from '../model/request/run-simulation.request';
import { SimulationType, SimulationStatus } from '../db/enum/enums';
import { Types } from 'mongoose';

import repositoryFactory from '../db/repositories/factory';
import { AgentDocument } from '../db/models/agent.model';
import { runConversation } from './conversation.service';
import { RunABTestingRequest } from '@simulation/model/request/run-ab-testing.request';

const agentRepository = repositoryFactory.agentRepository;
const simulationRepository = repositoryFactory.simulationRepository;

/**
 * Creates a simulation object and initiates the simulation.
 * @param request - The simulation configuration.
 * @returns A promise that resolves to the simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function initiate(request: RunSimulationRequest): Promise<SimulationDocument> {
  console.log('Simulation initiated...');
  console.log('Configuration:', request);

  let userAgent: AgentDocument | null = null;
  let serviceAgent: AgentDocument | null = null;
  console.log('Creating simulation object...');
  if (request.serviceAgentConfig !== undefined) {
    serviceAgent = await agentRepository.create(request.serviceAgentConfig!);
  } else if (request.serviceAgentId !== undefined) {
    serviceAgent = await agentRepository.getById(request.serviceAgentId!);
  }
  if (request.userAgentConfig !== undefined) {
    userAgent = await agentRepository.create(request.userAgentConfig!);
  } else if (request.userAgentId !== undefined) {
    userAgent = await agentRepository.getById(request.userAgentId!);
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

  const simulation = await simulationRepository.create(simulationData);
  console.log(simulation);

  run(simulation, request, serviceAgent, userAgent);

  return simulation;
}
/**
 * Creates a simulation object and initiates the simulation.
 * @param request - The simulation configuration.
 * @returns A promise that resolves to a simulation[].
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function initiateAB(request: RunABTestingRequest): Promise<SimulationDocument[]> {
  console.log('Simulation initiated...');
  console.log('Configuration:', request);

  let userAgent: AgentDocument | null = null;
  let serviceAgent1: AgentDocument | null = null;
  let serviceAgent2: AgentDocument | null = null;
  console.log('Creating simulation object...');

  if (request.serviceAgent1Config !== undefined) {
    serviceAgent1 = await agentRepository.create(request.serviceAgent1Config!);
  } else if (request.serviceAgent1Id !== undefined) {
    serviceAgent1 = await agentRepository.getById(request.serviceAgent1Id!);
  }
  if (request.serviceAgent2Config !== undefined) {
    serviceAgent2 = await agentRepository.create(request.serviceAgent2Config!);
  } else if (request.serviceAgent2Id !== undefined) {
    serviceAgent2 = await agentRepository.getById(request.serviceAgent2Id!);
  }
  if (request.userAgentConfig !== undefined) {
    userAgent = await agentRepository.create(request.userAgentConfig!);
  } else if (request.userAgentId !== undefined) {
    userAgent = await agentRepository.getById(request.userAgentId!);
  }

  if (userAgent === null || serviceAgent1 === null || serviceAgent2 === null) {
    throw new Error('User agent or service agent id not found');
  }

  const simulationData1: Partial<SimulationDocument> = {
    scenario: request.scenario,
    type: SimulationType.AB_TESTING,
    name: request.name,
    userAgent: userAgent,
    serviceAgent: serviceAgent1,
    numConversations: request.numConversations,
    conversations: [],
    status: SimulationStatus.SCHEDULED,
  };
  const simulation1: SimulationDocument = await simulationRepository.create(simulationData1);

  const simulationData2: Partial<SimulationDocument> = {
    scenario: request.scenario,
    type: SimulationType.AB_TESTING,
    name: request.name,
    userAgent: userAgent,
    serviceAgent: serviceAgent2,
    numConversations: request.numConversations,
    conversations: [],
    status: SimulationStatus.SCHEDULED,
    abPartner: simulation1._id,
  };
  const simulation2: SimulationDocument = await simulationRepository.create(simulationData2);

  simulation1.abPartner = simulation2._id;
  await simulationRepository.updateById(simulation1._id, simulation1);

  runAB(simulation1, simulation2, request, serviceAgent1, serviceAgent2, userAgent);

  return [simulation1, simulation2];
}

/**
 * Run the simulation.
 */
async function run(
  simulation: SimulationDocument,
  request: RunSimulationRequest,
  serviceAgent: AgentDocument,
  userAgent: AgentDocument,
) {
  const conversations: Types.ObjectId[] = [];

  const numConversations = request.numConversations;
  if (numConversations <= 0 || numConversations > 2) {
    throw new Error(
      'Number of conversations must be between 1 and 2 (just for now so nobody miss clicks and runs 100 conversations which would cost a lot of money))',
    );
  }

  for (let i = 0; i < numConversations; i++) {
    simulation.status = SimulationStatus.RUNNING;
    await simulationRepository.updateById(simulation._id, simulation);
    conversations.push(await runConversation(serviceAgent, userAgent));
  }

  simulation.status = SimulationStatus.FINISHED;
  simulation.conversations = conversations;
  await simulationRepository.updateById(simulation._id, simulation);
}
/**
 * Starts two simulations for AB testing
 */
async function runAB(
  simulation1: SimulationDocument,
  simulation2: SimulationDocument,
  request: RunSimulationRequest,
  serviceAgent1: AgentDocument,
  serviceAgent2: AgentDocument,
  userAgent: AgentDocument,
) {
  await run(simulation1, request, serviceAgent1, userAgent);
  await run(simulation2, request, serviceAgent2, userAgent);
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
  const simulations: SimulationDocument[] = await simulationRepository.findAll();
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
  initiateAB,
  poll,
  getConversations,
  getAll,
  update,
  del,
};
