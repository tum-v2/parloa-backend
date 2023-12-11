import { Model, Types } from 'mongoose';
import { logger } from '@utils/logger';
import { BaseRepository } from '@db/repositories/base.repository';
import { SimulationDocument } from '@db/models/simulation.model';
import { ConversationDocument } from '@db/models/conversation.model';
import { SimulationType } from '@enums/simulation-type.enum';
import { SimulationStatus } from '@enums/simulation-status.enum';

class SimulationRepository extends BaseRepository<SimulationDocument> {
  constructor(model: Model<SimulationDocument>) {
    super(model);
  }

  // WRITE //

  /**
   * Updates a simulation by id
   * @param id - simulation id
   * @param data - data to update
   * @returns Updated simulation
   */
  async updateById(id: string, data: Partial<SimulationDocument>): Promise<SimulationDocument | null> {
    const result: SimulationDocument | null = await super.updateById(id, data);
    if (result) {
      return await this._populate(result);
    }
    return result;
  }

  /**
   * Saves an evaluation to a simulation
   * @param simulationId - simulation id
   * @param evaluationId - evaluation id
   * @returns Updated simulation
   */
  async saveEvaluation(simulationId: string, evaluationId: string): Promise<SimulationDocument | null> {
    return await this.updateById(simulationId, { evaluation: new Types.ObjectId(evaluationId) });
  }

  /**
   * Increases the total number of interactions of a simulation by 'by'
   * @param simulationId - simulation id
   * @param by - number to increase by
   */
  async increaseTotalNumberOfInteractions(simulationId: string, by: number): Promise<void> {
    await this.model.updateOne({ _id: simulationId }, { $inc: { totalNumberOfInteractions: by } });
  }

  // GET ATTRIBUTE //

  /**
   * Gets all conversations of a simulation
   * @param id - simulation id
   * @returns Array of conversations
   */
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

  // FIND //

  /**
   * Finds all simulations
   * @returns Array of all simulations
   */
  async findAll(): Promise<SimulationDocument[]> {
    try {
      const result = await this.model.find();
      return result;
    } catch (error) {
      logger.error(`Error finding simulations!`);
      throw error;
    }
  }

  /**
   * Finds simulation by id
   * @param id - simulation id
   * @returns SimulationDocument of given id
   */
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

  /**
   * Finds all simulations that are not of child simulations of type 'optimization'
   * @returns Array of parent simulations
   */
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

  // AGGREGATE //

  /**
   * Counts the number of messages in each conversation in each simulation in the last 'days' days
   * @param days - number of days to look back
   * @returns the number of total interactions
   */
  async getTotalInteractions(days: number): Promise<number> {
    try {
      const result = await this.model.aggregate([
        {
          // filters simulations by date, type, and status
          $match: {
            createdAt: {
              $gte: this._daysAgo(days),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },

        // sums the number of messages in each conversation
        {
          $group: {
            _id: null,
            interactions: { $sum: '$totalNumberOfInteractions' },
          },
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

  /**
   * Counts the number of simulations in the last 'days' days
   * @param days - number of days to look back
   * @returns the number of simulation runs
   */
  async getSimulationRuns(days: number): Promise<number> {
    try {
      const result = await this.model.aggregate([
        {
          // filters simulations by date, type, and status
          $match: {
            createdAt: {
              $gte: this._daysAgo(days),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },

        // counts the number of simulations into a new field called 'simulationRuns'
        { $count: 'simulationRuns' },
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

  /**
   * Gets simulation.evaluation.successRate and averages them
   * @param days - number of days to look back
   * @returns Average success rate
   */
  async getAverageSuccessRate(days: number): Promise<number> {
    try {
      const result = await this.model.aggregate([
        {
          // filters simulations by date, type, and status
          $match: {
            createdAt: {
              $gte: this._daysAgo(days),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },

        // joins simulations with evaluations on evaluation id
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

        // averages the success rate of each simulation
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

  /**
   * Returns simulation.evaluation.successRate for each simulation in the last 'days' days
   * @param days - number of days to look back
   * @returns Array of ids and success rates
   */
  async getSimulationSuccessGraph(days: number): Promise<Partial<SimulationDocument>[]> {
    try {
      const result = await this.model.aggregate([
        {
          // filters simulations by date, type, and status
          $match: {
            createdAt: {
              $gte: this._daysAgo(days),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },

        // joins simulations with evaluations on evaluation id
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

        // returns only the _id and successRate fields
        {
          $project: {
            _id: 1,
            successRate: '$evaluation.successRate',
          },
        },

        // sorts by createdAt date
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

  /**
   * return simulation.evaluation.successRate for each simulation in the last 'days' days
   * @param days - number of days to look back
   * @returns Array of _id, name, createdAt, successRate, and (agent.domain as domain)
   */
  async getTop10Simulations(days: number): Promise<Partial<SimulationDocument>[]> {
    try {
      const result = await this.model.aggregate([
        {
          // filters simulations by date, type, and status
          $match: {
            createdAt: {
              $gte: this._daysAgo(days),
            },
            type: { $ne: SimulationType.CHAT },
            status: { $eq: SimulationStatus.FINISHED },
          },
        },

        // joins simulations with evaluations on evaluation id
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

        // joins simulations with agents on serviceAgent id
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

        // returns only the _id, name, createdAt, successRate, and (agent.domain as domain) fields
        {
          $project: {
            _id: 1,
            name: 1,
            createdAt: 1,
            successRate: '$evaluation.successRate',
            domain: '$serviceAgent.domain',
          },
        },

        // sorts by successRate descending
        {
          $sort: {
            successRate: -1,
          },
        },

        // limits the result to 10
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

  // UTIL //

  /**
   * Returns a date object for 'days' days ago
   * @param days - number of days to look back
   * @returns Date object
   */
  _daysAgo(days: number): Date {
    const DAYS_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
    return new Date(new Date().getTime() - days * DAYS_IN_MILLISECONDS);
  }

  async _populate(result: SimulationDocument): Promise<SimulationDocument> {
    return result;
  }
}

export { SimulationRepository };
