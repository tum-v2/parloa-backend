import { Model } from 'mongoose';
import { logger } from '../../service/logging-service';
import { BaseRepository } from './BaseRepository';
import { ConversationDocument } from '../models/Conversation';

class ConversationRepository extends BaseRepository<ConversationDocument> {
  constructor(model: Model<ConversationDocument>) {
    super(model);
  }

  async findByStartTime(startTime: Date): Promise<ConversationDocument[] | null> {
    try {
      const result = await this.model.find({ startTime }).exec();
      if (result.length > 0) {
        logger.info(`Conversations found by start time: ${result}`);
      } else {
        logger.warn(`No conversations found by start time: ${startTime}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding conversation by start time: ${startTime}`);
      throw error;
    }
  }
}

export { ConversationRepository };
