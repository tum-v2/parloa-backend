import repositoryFactory from '../db/repositories/factory';
import { AgentDocument } from '@simulation/db/models/agent.model';

const agentRepository = repositoryFactory.agentRepository;

async function create(agentData: Partial<AgentDocument>): Promise<AgentDocument> {
  return await agentRepository.create(agentData);
}

async function getById(id: string): Promise<AgentDocument | null> {
  return await agentRepository.getById(id);
}

async function update(id: string, agentData: Partial<AgentDocument>): Promise<AgentDocument | null> {
  return await agentRepository.updateById(id, agentData);
}

async function del(id: string): Promise<any> {
  return await agentRepository.deleteById(id);
}

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
