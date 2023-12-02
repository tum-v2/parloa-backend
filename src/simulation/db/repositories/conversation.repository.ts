import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { ConversationDocument } from '../models/conversation.model';
import { Types } from 'mongoose';

class ConversationRepository extends BaseRepository<ConversationDocument> {
  constructor(model: Model<ConversationDocument>) {
    super(model);
  }

  async saveEvaluation(conversationId: string, evaluationId: string): Promise<ConversationDocument | null> {
    return await super.updateById(conversationId, { evaluation: new Types.ObjectId(evaluationId) });
  }
}

export { ConversationRepository };
