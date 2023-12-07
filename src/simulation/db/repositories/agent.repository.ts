import { Model } from 'mongoose';
import { BaseRepository } from '@simulation/db/repositories/base.repository';
import { AgentDocument } from '@simulation/db/models/agent.model';

class AgentRepository extends BaseRepository<AgentDocument> {
  constructor(model: Model<AgentDocument>) {
    super(model);
  }
}

export { AgentRepository };
