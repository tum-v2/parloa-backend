import { BaseRepository } from '@simulation/db/repositories/base.repository';
import { EvaluationDocument, EvaluationDocumentWithConversation } from '../models/evaluation.model';
import { Model } from 'mongoose';
import { logger } from 'evaluation/service/logging.service';
import { SimulationDocument } from '@simulation/db/models/simulation.model';
import { ConversationDocument } from '@simulation/db/models/conversation.model';

class EvaluationRepository extends BaseRepository<EvaluationDocument> {
  constructor(model: Model<EvaluationDocument>) {
    super(model);
  }

  async findConversationEvaluationsBySimulation(
    simulation: SimulationDocument,
  ): Promise<EvaluationDocumentWithConversation[]> {
    try {
      simulation = await simulation.populate({
        path: 'conversations',
        populate: {
          path: 'evaluation',
          model: 'Evaluation',
          populate: {
            path: 'metrics',
            model: 'Metric',
          },
        },
      });
      return (simulation.conversations as ConversationDocument[]).map(
        (conversation) => conversation.evaluation,
      ) as EvaluationDocumentWithConversation[];
    } catch (error) {
      logger.error(`Error fetching evaluations by simulation id ${simulation.id}`);
      throw error;
    }
  }
}

export { EvaluationRepository };
