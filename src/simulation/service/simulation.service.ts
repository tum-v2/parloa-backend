import { Types } from 'mongoose';

import { SimulationDocument } from '../db/models/simulation.model';
import { ConversationDocument } from '../db/models/conversation.model';
import { RunSimulationRequest } from '../model/request/run-simulation.request';
import { SimulationStatus } from '../db/enum/enums';

import repositoryFactory from '../db/repositories/factory';

const agentRepository = repositoryFactory.agentRepository;
const simulationRepository = repositoryFactory.simulationRepository;

/**
 * Creates a simulation object and initiates the simulation.
 * @param {Types.ObjectId} simulationId - The ID of the simulation object to retrieve.
 * @returns {Promise<SimulationDocument>} A promise that resolves to the simulation object.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function initiate(request: RunSimulationRequest): Promise<SimulationDocument> {
  console.log('Simulation initiated...');
  console.log('Configuration:', request);

  console.log('Creating simulation object...');
  const userAgent = await agentRepository.createAgent(request.userAgentConfig);
  const serviceAgent = await agentRepository.createAgent(request.serviceAgentConfig);

  const simulationData: Partial<SimulationDocument> = {
    user: request.user,
    scenario: request.scenario,
    type: request.type,
    domain: request.domain,
    name: request.name,
    numConversations: request.numConversations,
    agents: [userAgent, serviceAgent],
    conversations: [],
    status: SimulationStatus.SCHEDULED,
  };

  const simulation = await simulationRepository.createSimulation(simulationData);
  console.log(simulation);
  return simulation;
}

/**
 * Retrieves a simulation object with populated user, agent, and conversation fields.
 * @param {Types.ObjectId} simulationId - The ID of the simulation object to retrieve.
 * @returns {Promise<SimulationDocument | null>} A promise that resolves to the simulation object with populated references, or null if not found.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function poll(simulationId: Types.ObjectId): Promise<SimulationDocument | null> {
  console.log(simulationId);
  const simulation = await simulationRepository.findById(simulationId);

  // TODO Trim unnecessary details
  return simulation;
}

/**
 * Retrieves a simulation object with relevant details to show client-side.
 * @param {Types.ObjectId} simulationId - The ID of the simulation object to retrieve.
 * @returns {Promise<SimulationDocument | null>} A promise that resolves to the simulation object with populated references, or null if not found.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function getDetails(simulationId: Types.ObjectId): Promise<SimulationDocument | null> {
  console.log(simulationId);
  const simulation = await simulationRepository.findById(simulationId);
  // TODO trim unnecessary details

  // return {timeToRun, numOfInteractions, numOfRuns, successRate}
  return simulation;
}

/**
 * Retrieves conversations in a simulation object.
 * @param {Types.ObjectId} simulationId - The ID of the simulation object to retrieve.
 * @returns {Promise<ConversationDocument[]>} A promise that resolves to the conversation object.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function getConversations(simulationId: Types.ObjectId): Promise<ConversationDocument[]> {
  console.log(simulationId);
  const simulation = await simulationRepository.findById(simulationId);
  if (simulation) {
    return simulation.conversations as ConversationDocument[];
  } else {
    return [];
  }
}

export default {
  initiate,
  poll,
  getDetails,
  getConversations,
};
