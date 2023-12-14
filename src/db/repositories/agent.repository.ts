import { Model } from 'mongoose';
import { BaseRepository } from '@db/repositories/base.repository';
import { AgentDocument } from '@db/models/agent.model';

class AgentRepository extends BaseRepository<AgentDocument> {
  constructor(model: Model<AgentDocument>) {
    super(model);
  }

  public async findAll(): Promise<AgentDocument[]> {
    return this.model.find({ temporary: { $ne: true } });
  }
}

export { AgentRepository };
