import { Types } from 'mongoose';

import { SimulationDocument } from '../db/models/simulation.model';
import { ConversationDocument } from '../db/models/conversation.model';
import { RunSimulationRequest } from '../model/request/run-simulation.request';
import { SimulationStatus } from '../db/enum/enums';

import repositoryFactory from '../db/repositories/factory';
import { UpdateSimulationRequest } from '@simulation/model/request/update-simulation.request';
import { UpdateSimulationResponse } from '@simulation/model/response/update-simulation.response';

const agentRepository = repositoryFactory.agentRepository;
const simulationRepository = repositoryFactory.simulationRepository;

/**
 * Creates a simulation object and initiates the simulation.
 * @param {RunSimulationRequest} request - The simulation configuration.
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
async function poll(simulationId: Types.ObjectId): Promise<SimulationDocument> {
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
async function getDetails(simulationId: Types.ObjectId): Promise<SimulationDocument> {
  console.log(simulationId);
  const simulation = await simulationRepository.findById(simulationId);
  // TODO trim unnecessary details

  // return {timeToRun, numOfInteractions, numOfRuns, successRate}
  return simulation;
}

/**
 * Retrieves conversations in a simulation object.
 * @param {Types.ObjectId} simulationId - The ID of the simulation object to retrieve.
 * @returns {Promise<ConversationDocument[]>} A promise that resolves to the conversation object list.
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

/**
 * Fetches all simulations.
 * @returns {Promise<SimulationDocument[]>} A promise that resolves to simulation object list.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function getAll(): Promise<SimulationDocument[]> {
  const simulation = await simulationRepository.findAll();
  if (simulation) {
    return simulation;
  } else {
    return [];
  }
}

/**
 * Updates the simulation object.
 * @param {Types.ObjectId} simulationId - The ID of the simulation object to update.
 * @param {UpdateSimulationRequest}
 * @returns {Promise<SimulationDocument>} A promise that resolves to the updated simulation object.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function update(
  simulationId: Types.ObjectId,
  updates: UpdateSimulationRequest,
): Promise<UpdateSimulationResponse> {
  const success = await simulationRepository.update(simulationId, updates);
  const simulation = await simulationRepository.findById(simulationId);
  return { object: simulation, success: success };
}

/**
 * Deletes the simulation object.
 * @param {Types.ObjectId} simulationId - The ID of the simulation object to update.
 * @param {UpdateSimulationRequest}
 * @returns {Promise<SimulationDocument>} A promise that resolves to the updated simulation object.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function del(simulationId: Types.ObjectId): Promise<boolean> {
  const success = await simulationRepository.delete(simulationId);
  return success;
}

export default {
  initiate,
  poll,
  getDetails,
  getConversations,
  getAll,
  update,
  del,
};
