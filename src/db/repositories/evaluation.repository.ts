import { BaseRepository } from '@db/repositories/base.repository';
import { EvaluationDocument, EvaluationDocumentWithConversation } from '@db/models/evaluation.model';
import { Model } from 'mongoose';
import { logger } from '@utils/logger';
import { SimulationDocument } from '@db/models/simulation.model';
import { ConversationDocument } from '@db/models/conversation.model';

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

      if (!simulation.conversations) {
        throw new Error('evaluation.repository#30: simulation.conversations is undefined');
      }

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
