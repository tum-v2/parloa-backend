import repositoryFactory from '@db/repositories/factory';
import { AgentDocument } from '@db/models/agent.model';

const agentRepository = repositoryFactory.agentRepository;

/**
 * Creates an agent object and store it in the database
 * @param agentData - The agent configuration
 * @returns A promise that resolves to the created agent
 */
async function create(agentData: Partial<AgentDocument>): Promise<AgentDocument> {
  return await agentRepository.create(agentData);
}

/**
 * Fetches an agent object given its id
 * @param id - The agent id
 * @returns A promise that resolves to the agent with the specified id
 */
async function getById(id: string): Promise<AgentDocument | null> {
  return await agentRepository.getById(id);
}

/**
 * Updates an agent object given its id and
 * @param id - The agent id
 * @param agentData - The agent configuration
 * @returns A promise that resolves to the updated agent with the specified id
 */
async function update(id: string, agentData: Partial<AgentDocument>): Promise<AgentDocument | null> {
  return await agentRepository.updateById(id, agentData);
}

/**
 * Deletes an agent object given its id
 * @param id - The agent id
 * @returns  A promise that resolves to whether deletion was successful
 */
async function del(id: string): Promise<any> {
  return await agentRepository.deleteById(id);
}

/**
 * Retrieve all agents
 * @returns  A promise that resolves to all agents stored in the database
 */
async function getAll(): Promise<AgentDocument[]> {
  return await agentRepository.findAll();
}

export default {
  create,
  getById,
  update,
  del,
  getAll,
};
