import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { AgentDocument } from '../models/agent.model';

class AgentRepository extends BaseRepository<AgentDocument> {
  constructor(model: Model<AgentDocument>) {
    super(model);
  }
}

export { AgentRepository };
