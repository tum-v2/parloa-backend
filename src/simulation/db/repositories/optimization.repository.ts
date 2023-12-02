import { Model } from 'mongoose';
import { logger } from '../../service/logging.service';
import { BaseRepository } from './base.repository';
import { OptimizationDocument } from '../models/optimization.model';

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
}

export { OptimizationRepository };
