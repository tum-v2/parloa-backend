import { Model, Types } from 'mongoose';
import { logger } from '../../service/logging-service';
import { BaseRepository } from './base.repository';
import { SimulationDocument } from '../models/simulation.model';
import { ConversationDomain, ConversationType, SimulationStatus } from '../enum/enums';

class SimulationRepository extends BaseRepository<SimulationDocument> {
  constructor(model: Model<SimulationDocument>) {
    super(model);
  }

  async findByUser(userId: Types.ObjectId): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find({ user: userId }).exec();
      if (result.length > 0) {
        logger.info(`Simulations found by user: ${result}`);
      } else {
        logger.warn(`No simulations found by user: ${userId}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations by user: ${userId}`);
      throw error;
    }
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
}

export { SimulationRepository };