import { BaseRepository } from '@simulation/db/repositories/base.repository';
import { EvaluationDocument } from '../models/evaluation.model';
import { Model } from 'mongoose';

class EvaluationRepository extends BaseRepository<EvaluationDocument> {
  constructor(model: Model<EvaluationDocument>) {
    super(model);
  }
}

export { EvaluationRepository };
