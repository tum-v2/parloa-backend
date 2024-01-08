import { GoalDocument } from '@db/models/goal.model';
import { BaseRepository } from '@db/repositories/base.repository';
import { Model } from 'mongoose';

class GoalRepository extends BaseRepository<GoalDocument> {
  constructor(model: Model<GoalDocument>) {
    super(model);
  }
}

export { GoalRepository };
