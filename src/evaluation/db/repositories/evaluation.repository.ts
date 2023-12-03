import { BaseRepository } from '@simulation/db/repositories/base.repository';
import { EvaluationDocument } from '../models/evaluation.model';
import { Model } from 'mongoose';
import { logger } from 'evaluation/service/logging.service';

class EvaluationRepository extends BaseRepository<EvaluationDocument> {
  constructor(model: Model<EvaluationDocument>) {
    super(model);
  }

  async findByConversation(conversationID: string): Promise<EvaluationDocument | null> {
    try {
      const result: EvaluationDocument | null = await this.model.findOne({ conversation: conversationID });
      if (result) {
        return await result.populate('metrics');
      }
      logger.error(`No evaluation with conversation id ${conversationID} found`);
      return null;
    } catch (error) {
      logger.error(`Error fetching evaluation by conversation id ${conversationID}`);
      throw error;
    }
  }

  async findBySimulation(simulationID: string): Promise<EvaluationDocument[]> {
    try {
      const result: EvaluationDocument[] = await this.model.find({ simulation: simulationID });
      const promises = result.map((evaluation) => evaluation.populate('metrics'));
      return await Promise.all(promises);
    } catch (error) {
      logger.error(`Error fetching evaluations by simulation id ${simulationID}`);
      throw error;
    }
  }
}

export { EvaluationRepository };
