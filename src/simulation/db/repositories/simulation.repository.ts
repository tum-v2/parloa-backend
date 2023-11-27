import { Model, Types } from 'mongoose';
import { logger } from '../../service/logging.service';
import { BaseRepository } from './base.repository';
import { SimulationDocument } from '../models/simulation.model';
import { ConversationDomain, ConversationType, SimulationStatus } from '../enum/enums';
import { ConversationDocument } from '../models/conversation.model';

class SimulationRepository extends BaseRepository<SimulationDocument> {
  constructor(model: Model<SimulationDocument>) {
    super(model);
  }

  // region GET_ATTRIBUTE //

  async getConversationsById(id: string): Promise<ConversationDocument[] | null> {
    try {
      const simulation: SimulationDocument | null = await this.model.findById(id).populate('conversations');
      if (simulation) {
        return simulation.conversations as ConversationDocument[];
      }
      logger.error(`No simulations found by simulation id: ${id}`);
      return null;
    } catch (error) {
      logger.error(`Error fetching conversations by simulation id: ${id}`);
      throw error;
    }
  }

  // endegion GET_ATTRIBUTE //

  // region FIND //

  async findAll(): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find();
      return result;
    } catch (error) {
      logger.error(`Error finding simulations!`);
      throw error;
    }
  }

  async findById(id: string): Promise<SimulationDocument | null> {
    try {
      const result: SimulationDocument | null = await super.getById(id);
      if (result) {
        return await this._populate(result);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations by id: ${id}`);
      throw error;
    }
  }

  async updateById(id: string, data: Partial<SimulationDocument>): Promise<SimulationDocument | null> {
    const result: SimulationDocument | null = await super.updateById(id, data);
    if (result) {
      return await this._populate(result);
    }
    return result;
  }

  async findByScenarioName(scenarioName: string): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find({ scenarioName }).exec();
      if (result.length > 0) {
        logger.info(`Simulations found by scenario name: ${result}`);
      } else {
        logger.warn(`No simulations found by scenario name: ${scenarioName}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations by scenario name: ${scenarioName}`);
      throw error;
    }
  }

  async findByConversationType(conversationType: ConversationType): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find({ conversationType }).exec();
      if (result.length > 0) {
        logger.info(`Simulations found by conversation type: ${result}`);
      } else {
        logger.warn(`No simulations found by conversation type: ${conversationType}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations by conversation type: ${conversationType}`);
      throw error;
    }
  }

  async findByConversationDomain(conversationDomain: ConversationDomain): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find({ conversationDomain }).exec();
      if (result.length > 0) {
        logger.info(`Simulations found by conversation domain: ${result}`);
      } else {
        logger.warn(`No simulations found by conversation domain: ${conversationDomain}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations by conversation domain: ${conversationDomain}`);
      throw error;
    }
  }

  async findByName(name: string): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find({ name }).exec();
      if (result.length > 0) {
        logger.info(`Simulations found by model:  ${result}`);
      } else {
        logger.warn(`No simulations found by  name: ${name}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations by  name: ${name}`);
      throw error;
    }
  }

  async findByAgent(agentId: Types.ObjectId): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find({ agents: agentId }).exec();
      if (result.length > 0) {
        logger.info(`Simulations found by agent: ${result}`);
      } else {
        logger.warn(`No simulations found by agent: ${agentId}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations by agent: ${agentId}`);
      throw error;
    }
  }

  async findBySimulationStatus(simulationStatus: SimulationStatus): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find({ simulationStatus }).exec();
      if (result.length > 0) {
        logger.info(`Simulations found by simulation status: ${result}`);
      } else {
        logger.warn(`No simulations found by simulation status: ${simulationStatus}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations by simulation status: ${simulationStatus}`);
      throw error;
    }
  }

  // endregion FIND_BY_ATTRIBUTE //

  async _populate(result: SimulationDocument): Promise<SimulationDocument> {
    return result;
  }
}

export { SimulationRepository };
