import { Model } from 'mongoose';
import { logger } from '../../service/logging.service';
import { BaseRepository } from './base.repository';
import { AgentDocument } from '../models/agent.model';
import { LLMModel, ConversationDomain } from '../enum/enums';

class AgentRepository extends BaseRepository<AgentDocument> {
  constructor(model: Model<AgentDocument>) {
    super(model);
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

  async findByParameters(
    llm: LLMModel,
    temperature: number,
    maxTokens: number,
    domain: ConversationDomain,
  ): Promise<AgentDocument | null> {
    try {
      const agent = await this.model.find({
        llm,
        temperature,
        maxTokens,
        domain,
      });

      if (agent.length > 0) {
        logger.info(`Agents found:  ${agent[0]}`);
      } else {
        logger.warn(`No agents found`);
      }
      return agent[0];
    } catch (error) {
      console.error('Error finding agent:', error);
      throw error;
    }
  }
}

export { AgentRepository };
