import { SimulationDocument } from '../db/models/simulation.model';
import { ConversationDocument } from '../db/models/conversation.model';
import { RunSimulationRequest } from '../model/request/run-simulation.request';
import { SimulationStatus } from '../db/enum/enums';

import repositoryFactory from '../db/repositories/factory';
import { AgentDocument } from '@simulation/db/models/agent.model';

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
  const userAgent: AgentDocument = await agentRepository.create(request.userAgentConfig);
  const serviceAgent: AgentDocument = await agentRepository.create(request.serviceAgentConfig);

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

  const simulation = await simulationRepository.create(simulationData);
  console.log(simulation);
  return simulation;
}

/**
 * Retrieves a simulation object with populated user, agent, and conversation fields.
 * @param {string} id - The ID of the simulation object to retrieve.
 * @returns {Promise<SimulationDocument>} A promise that resolves to the simulation object with populated references, or null if not found.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function poll(id: string): Promise<SimulationDocument> {
  return simulationRepository.findById(id);
}

/**
 * Retrieves a simulation object with relevant details to show client-side.
 * @param {string} id - The ID of the simulation object to retrieve.
 * @returns {Promise<SimulationDocument>} A promise that resolves to the simulation object with populated references, or null if not found.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function getDetails(id: string): Promise<SimulationDocument> {
  console.log(id);
  const simulation = await simulationRepository.findById(id);
  // TODO trim unnecessary details

  // return {timeToRun, numOfInteractions, numOfRuns, successRate}
  return simulation;
}

/**
 * Retrieves conversations in a simulation object.
 * @param {string} id - The ID of the simulation object to retrieve.
 * @returns {Promise<ConversationDocument[]>} A promise that resolves to the conversation object list.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function getConversations(id: string): Promise<ConversationDocument[]> {
  return await simulationRepository.getConversationsById(id);
}

/**
 * Fetches all simulations.
 * @returns {Promise<SimulationDocument[]>} A promise that resolves to simulation object list.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function getAll(): Promise<SimulationDocument[]> {
  return await simulationRepository.findAll();
}

/**
 * Updates the simulation object.
 * @param {string} id - The ID of the simulation object to update.
 * @param {UpdateSimulationRequest}
 * @returns {Promise<SimulationDocumen | null>} A promise that resolves to the updated simulation object.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function update(id: string, updates: Partial<SimulationDocument>): Promise<SimulationDocument | null> {
  return await simulationRepository.updateById(id, updates);
}

/**
 * Deletes the simulation object.
 * @param {string} id - The ID of the simulation object to update.
 * @param {UpdateSimulationRequest}
 * @returns {Promise<SimulationDocument>} A promise that resolves to the updated simulation object.
 * @throws {Error} Throws an error if there is an issue with the MongoDB query.
 */
async function del(id: string): Promise<boolean> {
  return await simulationRepository.deleteById(id);
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
