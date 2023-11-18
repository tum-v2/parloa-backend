import { Model, Types } from 'mongoose';
import { logger } from '../../service/logging.service';
import { BaseRepository } from './base.repository';
import { SimulationDocument } from '../models/simulation.model';
import { ConversationDomain, ConversationType, SimulationStatus } from '../enum/enums';
import { ConversationDocument } from '../models/conversation.model';
import { UpdateSimulationRequest } from '@simulation/model/request/update-simulation.request';

class SimulationRepository extends BaseRepository<SimulationDocument> {
  constructor(model: Model<SimulationDocument>) {
    super(model);
  }

  // region WRITE //

  async createSimulation(config: Partial<SimulationDocument>): Promise<SimulationDocument> {
    try {
      const simulation = await this.model.create(config);
      logger.info(`Simulation created: ${simulation}`);
      return simulation;
    } catch (error) {
      logger.error(`Error creating simulation with configuration: ${config}`);
      throw error;
    }
  }

  async update(id: Types.ObjectId, updates: UpdateSimulationRequest): Promise<boolean> {
    try {
      const result = await this.model.updateOne({ _id: id }, { $set: updates });
      if (result.modifiedCount === 1) {
        logger.info(`Simulation ${id} updated successfully`);
      } else {
        logger.error(`Simulation ${id} not found or no updates applied`);
        throw `Simulation ${id} not found or no updates applied`;
      }
      return result.modifiedCount === 1;
    } catch (error) {
      logger.error(`Error updating simulation with id: ${id}`);
      throw error;
    }
  }

  async delete(id: Types.ObjectId): Promise<boolean> {
    try {
      const result = await this.model.deleteOne({ _id: id });
      if (result.deletedCount === 1) {
        logger.info(`Simulation ${id} deleted successfully`);
      } else {
        logger.error(`Simulation ${id} not found or not deleted`);
        throw `Simulation ${id} not found or not deleted`;
      }
      return result.deletedCount === 1;
    } catch (error) {
      logger.error(`Error deleting simulation with id: ${id}`);
      throw error;
    }
  }

  // endregion WRITE //

  // region GET_ATTRIBUTE //

  async getConversationsBySimulationId(id: Types.ObjectId): Promise<ConversationDocument[]> {
    try {
      const simulation: SimulationDocument = await this.findById(id);
      if (simulation) {
        return simulation.conversations as ConversationDocument[];
      }
      logger.warn(`No conversations found by simulation id: ${id}`);
      return [];
    } catch (error) {
      logger.error(`Error fetching conversations by simulation id: ${id}`);
      throw error;
    }
  }

  // endegion GET_ATTRIBUTE //

  // region FIND_BY_ATTRIBUTE //

  async findAll(): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.aggregate([
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
        { $lookup: { from: 'agents', localField: 'agents', foreignField: '_id', as: 'agents' } },
        { $lookup: { from: 'conversations', localField: 'conversations', foreignField: '_id', as: 'conversations' } },
        { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
      ]);
      return result;
    } catch (error) {
      logger.error(`Error finding simulations!`);
      throw error;
    }
  }

  async findById(id: Types.ObjectId): Promise<SimulationDocument> {
    try {
      const result = await this.model.aggregate([
        { $match: { _id: id } },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
        { $lookup: { from: 'agents', localField: 'agents', foreignField: '_id', as: 'agents' } },
        { $lookup: { from: 'conversations', localField: 'conversations', foreignField: '_id', as: 'conversations' } },
        { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
      ]);
      const simulation = result[0] as SimulationDocument;
      if (simulation) {
        logger.info(`Simulation found by id: ${simulation}`);
      } else {
        logger.error(`No simulations found by id: ${id}`);
        throw `No simulations found by id: ${id}`;
      }
      return simulation;
    } catch (error) {
      logger.error(`Error finding simulations by id: ${id}`);
      throw error;
    }
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
}

export { SimulationRepository };
