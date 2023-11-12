import { Model } from 'mongoose';
import { logger } from '../../service/logging-service';
import { BaseRepository } from './BaseRepository';
import { AgentDocument } from '../models/Agent';

class AgentRepository extends BaseRepository<AgentDocument> {
  constructor(model: Model<AgentDocument>) {
    super(model);
  }

  async findByModelName(modelName: string): Promise<AgentDocument[] | null> {
    try {
      const result = await this.model.find({ modelName }).exec();
      if (result.length > 0) {
        logger.info(`Agents found by model:  ${result}`);
      } else {
        logger.warn(`No agents found by model name: ${modelName}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding agent by model name: ${modelName}`);
      throw error;
    }
  }
}

export { AgentRepository };
