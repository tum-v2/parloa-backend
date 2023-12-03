import { BaseRepository } from '@simulation/db/repositories/base.repository';
import { Model } from 'mongoose';
import { MetricDocument } from '../models/metric.model';

class MetricRepository extends BaseRepository<MetricDocument> {
  constructor(model: Model<MetricDocument>) {
    super(model);
  }
}

export { MetricRepository };
