import { BaseRepository } from '@db/repositories/base.repository';
import { EvaluationDocument, EvaluationDocumentWithConversation } from '@db/models/evaluation.model';
import { Model } from 'mongoose';
import { logger } from '@utils/logger';

class EvaluationRepository extends BaseRepository<EvaluationDocument> {
  constructor(model: Model<EvaluationDocument>) {
    super(model);
  }

  async findConversationEvaluationsBySimulation(simulationID: string): Promise<EvaluationDocumentWithConversation[]> {
    try {
      const result: EvaluationDocumentWithConversation[] = await this.model.find({
        simulation: simulationID,
        conversation: { $ne: null },
      });
      const promises = result.map((evaluation) => evaluation.populate('metrics'));
      return await Promise.all(promises);
    } catch (error) {
      logger.error(`Error fetching evaluations by simulation id ${simulationID}`);
      throw error;
    }
  }
}

export { EvaluationRepository };
