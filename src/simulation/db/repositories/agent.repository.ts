import { Model } from 'mongoose';
import { logger } from '../../service/logging-service';
import { BaseRepository } from './base.repository';
import { AgentDocument } from '../models/agent.model';
import { LLMModel } from '../enum/enums';

class AgentRepository extends BaseRepository<AgentDocument> {
  constructor(model: Model<AgentDocument>) {
    super(model);
  }

  async createAgent(config: Partial<AgentDocument>) {
    try {
      const agent = await this.model.create(config);
      logger.info(`Agent created: ${agent}`);
      return agent;
    } catch (error) {
      logger.error(`Error creating agent with configuration: ${config}`);
      throw error;
    }
  }

  async findByModelName(modelName: LLMModel): Promise<AgentDocument[] | null> {
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
