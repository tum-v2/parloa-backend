import { Model } from 'mongoose';
import { logger } from 'utils/logger';
import { BaseRepository } from 'db/repositories/base.repository';
import { OptimizationDocument } from 'db/models/optimization.model';
import { SimulationDocument } from 'db/models/simulation.model';

class OptimizationRepository extends BaseRepository<OptimizationDocument> {
  constructor(model: Model<OptimizationDocument>) {
    super(model);
  }

  async addSimulationId(optimizationId: string, simulationId: string): Promise<OptimizationDocument | null> {
    try {
      const updatedDocument = await this.model
        .findByIdAndUpdate(optimizationId, { $addToSet: { simulations: simulationId } }, { new: true })
        .exec();

      return updatedDocument as OptimizationDocument | null; // Explicitly casting the result
    } catch (error) {
      logger.error(`Error adding simulation ID to optimization: ${error}`);
      throw error;
    }
  }

  async getSimulationsFromOptimization(id: string): Promise<SimulationDocument[] | null> {
    try {
      const optimization: OptimizationDocument | null = await this.model.findById(id).exec();
      if (optimization) {
        return optimization.simulations as SimulationDocument[];
      }
      logger.error(`No optimization found by id: ${id}`);
      return null;
    } catch (error) {
      logger.error(`Error fetching children simulations by optimization id: ${id}`);
      throw error;
    }
  }
}

export { OptimizationRepository };
