import { Model, Types } from 'mongoose';
import { logger } from '../../service/logging-service';
import { BaseRepository } from './base.repository';
import { MetricDocument } from '../models/metric.model';

class MetricRepository extends BaseRepository<MetricDocument> {
  constructor(model: Model<MetricDocument>) {
    super(model);
  }

  async findByConversation(conversationId: Types.ObjectId): Promise<MetricDocument[]> {
    try {
      const result = await this.model.find({ conversation: conversationId }).exec();
      if (result.length > 0) {
        logger.info(`Metrics found by conversation: ${result}`);
      } else {
        logger.warn(`No metrics found by conversation: ${conversationId}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding metrics by conversation: ${conversationId}`);
      throw error;
    }
  }

  async findByMetricType(metricType: string): Promise<MetricDocument[]> {
    try {
      const result = await this.model.find({ metricType }).exec();
      if (result.length > 0) {
        logger.info(`Metrics found by metric type: ${result}`);
      } else {
        logger.warn(`No metrics found by metric type: ${metricType}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding metrics by metric type: ${metricType}`);
      throw error;
    }
  }
}

export { MetricRepository };
