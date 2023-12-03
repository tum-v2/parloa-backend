import { Model, Types } from 'mongoose';
import { logger } from '../../service/logging.service';
import { BaseRepository } from './base.repository';
import { SimulationDocument } from '../models/simulation.model';
import { SimulationStatus, SimulationType } from '../enum/enums';
import { ConversationDocument } from '../models/conversation.model';

class SimulationRepository extends BaseRepository<SimulationDocument> {
  constructor(model: Model<SimulationDocument>) {
    super(model);
  }

  // region WRITE //

  async updateById(id: string, data: Partial<SimulationDocument>): Promise<SimulationDocument | null> {
    const result: SimulationDocument | null = await super.updateById(id, data);
    if (result) {
      return await this._populate(result);
    }
    return result;
  }

  async saveEvaluation(simulationId: string, evaluationId: string): Promise<SimulationDocument | null> {
    return await this.updateById(simulationId, { evaluation: new Types.ObjectId(evaluationId) });
  }

  // endregion WRITE //

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
  
  async findAllParentSimulations(): Promise<SimulationDocument[]> {
    try {
      const result = await this.model
        .find({ $nor: [{ type: SimulationType.OPTIMIZATION, optimization: null }] })
        .exec();
      if (result.length > 0) {
        logger.info(`Simulations not of type 'optimization' and with optimization found: ${result}`);
      } else {
        logger.warn(`No simulations found`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding simulations: ${error}`);
      throw error;
    }
  }

  // endregion FIND //

  // region AGGREGATE //

  async getTotalInteractions(days: number): Promise<number> {
    try {
      // Counts the number of messages in each conversation in each simulation in the last 'days' days
      const result = await this.model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },
        {
          $lookup: {
            from: 'conversations',
            localField: 'conversations',
            foreignField: '_id',
            as: 'conversations',
          },
        },
        {
          $unwind: '$conversations',
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'conversations.messages',
            foreignField: '_id',
            as: 'conversations.messages',
          },
        },
        {
          $unwind: '$conversations.messages',
        },
        {
          $count: 'interactions',
        },
      ]);

      if (result.length > 0) {
        logger.info(`Total interactions found: ${result[0].interactions}`);
        return result[0].interactions;
      } else {
        logger.warn(`No total interactions found!`);
        return 0;
      }
    } catch (error) {
      logger.error(`Error finding total interactions!`);
      throw error;
    }
  }

  async getSimulationRuns(days: number): Promise<number> {
    try {
      // Counts the number of simulations in the last 'days' days
      const result = await this.model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },
        {
          $count: 'simulationRuns',
        },
      ]);

      if (result.length > 0) {
        logger.info(`Total simulation runs found: ${result[0].simulationRuns}`);
        return result[0].simulationRuns;
      } else {
        logger.warn(`No total simulation runs found!`);
        return 0;
      }
    } catch (error) {
      logger.error(`Error finding total simulation runs!`);
      throw error;
    }
  }

  async getAverageSuccessRate(days: number): Promise<number> {
    // get simulation.evaluation.successRate and average them
    try {
      const result = await this.model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },
        {
          $lookup: {
            from: 'evaluations',
            localField: 'evaluation',
            foreignField: '_id',
            as: 'evaluation',
          },
        },
        {
          $unwind: '$evaluation',
        },
        {
          $group: {
            _id: null,
            avgSuccessRate: { $avg: '$evaluation.successRate' },
          },
        },
      ]);

      if (result.length > 0) {
        logger.info(`Average success rate found: ${result[0].avgSuccessRate}`);
        return result[0].avgSuccessRate;
      } else {
        logger.warn(`No average success rate found!`);
        return 0;
      }
    } catch (error) {
      logger.error(`Error finding average success rate!`);
      throw error;
    }
  }

  async getSimulationSuccessGraph(days: number): Promise<Partial<SimulationDocument>[]> {
    // return simulation.evaluation.successRate for each simulation in the last 'days' days
    // return only _id and successRate

    try {
      const result = await this.model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },
        {
          $lookup: {
            from: 'evaluations',
            localField: 'evaluation',
            foreignField: '_id',
            as: 'evaluation',
          },
        },
        {
          $unwind: '$evaluation',
        },
        {
          $project: {
            _id: 1,
            successRate: '$evaluation.successRate',
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
      ]);

      if (result.length > 0) {
        logger.info(`Simulation success graph found: ${result}`);
        return result;
      } else {
        logger.warn(`No simulation success graph found!`);
        return [];
      }
    } catch (error) {
      logger.error(`Error finding simulation success graph!`);
      throw error;
    }
  }

  async getTop10Simulations(days: number): Promise<Partial<SimulationDocument>[]> {
    // return simulation.evaluation.successRate for each simulation in the last 'days' days
    // return only _id, name, createdAt, successRate, and (agent.domain as domain)

    try {
      const result = await this.model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },
        {
          $lookup: {
            from: 'evaluations',
            localField: 'evaluation',
            foreignField: '_id',
            as: 'evaluation',
          },
        },
        {
          $unwind: '$evaluation',
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'serviceAgent',
            foreignField: '_id',
            as: 'serviceAgent',
          },
        },
        {
          $unwind: '$serviceAgent',
        },
        {
          $project: {
            _id: 1,
            name: 1,
            createdAt: 1,
            successRate: '$evaluation.successRate',
            domain: '$serviceAgent.domain',
          },
        },
        {
          $sort: {
            successRate: -1,
          },
        },
        {
          $limit: 10,
        },
      ]);

      if (result.length > 0) {
        logger.info(`Top 10 simulations found: ${result}`);
        return result;
      } else {
        logger.warn(`No top 10 simulations found!`);
        return [];
      }
    } catch (error) {
      logger.error(`Error finding top 10 simulations!`);
      throw error;
    }
  }

  // endregion AGGREGATE //

  // region UTIL //

  async _populate(result: SimulationDocument): Promise<SimulationDocument> {
    return result;
  }

  // endregion UTIL //
}

export { SimulationRepository };
