import { Model } from 'mongoose';
import { logger } from '../../service/logging.service';
import { BaseRepository } from './base.repository';
import { OptimizationDocument } from '../models/optimization.model';

class OptimizationRepository extends BaseRepository<OptimizationDocument> {
  constructor(model: Model<OptimizationDocument>) {
    super(model);
  }

  async findByPrompt(prompt: string): Promise<OptimizationDocument[]> {
    try {
      const result = await this.model.find({ prompt }).exec();
      if (result.length > 0) {
        logger.info(`Optimizations found by prompt: ${result}`);
      } else {
        logger.warn(`No optimizations found by prompt: ${prompt}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding optimizations by prompt: ${prompt}`);
      throw error;
    }
  }
}

export { OptimizationRepository };
