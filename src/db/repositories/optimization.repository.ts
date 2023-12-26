import { Model } from 'mongoose';
import { logger } from '@utils/logger';
import { BaseRepository } from '@db/repositories/base.repository';
import { OptimizationDocument } from '@db/models/optimization.model';
import { ChildSimulationRepresentation } from '@simulation/model/type/child-simulation-representation';

class OptimizationRepository extends BaseRepository<OptimizationDocument> {
  constructor(model: Model<OptimizationDocument>) {
    super(model);
  }

  async addChildSimulation(
    optimizationId: string,
    childSimulation: ChildSimulationRepresentation,
  ): Promise<OptimizationDocument | null> {
    try {
      const updatedDocument = await this.model
        .findByIdAndUpdate(optimizationId, { $addToSet: { simulations: childSimulation } }, { new: true })
        .exec();

      return updatedDocument as OptimizationDocument | null; // Explicitly casting the result
    } catch (error) {
      logger.error(`Error adding simulation ID to optimization: ${error}`);
      throw error;
    }
  }

  async getOptimizationDocument(optimizationId: string, iteration: number): Promise<OptimizationDocument | null> {
    try {
      const optimization = (await this.model
        .findOne({
          optimizationId: optimizationId,
          iteration: iteration,
        })
        .exec()) as OptimizationDocument | null; // Explicit type casting

      if (!optimization) {
        logger.error(`No optimization found with optimizationId: ${optimizationId} and iteration: ${iteration}`);
      }
      return optimization;
    } catch (error) {
      logger.error(
        `Error fetching optimization document by optimizationId: ${optimizationId} and iteration: ${iteration}`,
      );
      throw error;
    }
  }

  async getSimulationsInSingleIteration(
    optimizationId: string,
    iteration: number,
  ): Promise<ChildSimulationRepresentation[] | null> {
    try {
      const optimization = await this.getOptimizationDocument(optimizationId, iteration);

      if (optimization) {
        return optimization.simulations as ChildSimulationRepresentation[];
      }
      logger.error(`No optimization found by id: ${optimizationId}`);
      return null;
    } catch (error) {
      logger.error(`Error fetching children simulations by optimization id: ${optimizationId}`);
      throw error;
    }
  }
  //TODO
  /*
  async getSimulationsFromOptimization(optimizationId: string) {

  }
   */
}

export { OptimizationRepository };
