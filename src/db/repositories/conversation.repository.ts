import { Model } from 'mongoose';
import { BaseRepository } from 'db/repositories/base.repository';
import { ConversationDocument } from 'db/models/conversation.model';
import { Types } from 'mongoose';
import { logger } from 'utils/logger';

class ConversationRepository extends BaseRepository<ConversationDocument> {
  constructor(model: Model<ConversationDocument>) {
    super(model);
  }

  async getMessages(conversationId: string): Promise<ConversationDocument | null> {
    try {
      const conversation: ConversationDocument | null = await this.model.findById(conversationId).populate('messages');
      return conversation;
    } catch (error) {
      logger.error(`Error getting messages from conversation ${conversationId}!`);
      throw error;
    }
  }

  async saveEvaluation(conversationId: string, evaluationId: string): Promise<ConversationDocument | null> {
    return await super.updateById(conversationId, { evaluation: new Types.ObjectId(evaluationId) });
  }
}

export { ConversationRepository };
