import { Model } from 'mongoose';
import { logger } from '../../service/logging.service';
import { BaseRepository } from './base.repository';
import { ConversationDocument } from '../models/conversation.model';
import { ConversationStatus } from '../enum/enums';
import { MessageDocument } from '../models/message.model';

class ConversationRepository extends BaseRepository<ConversationDocument> {
  constructor(model: Model<ConversationDocument>) {
    super(model);
  }

  async getMessagesById(id: string): Promise<MessageDocument[] | null> {
    try {
      const conversation: ConversationDocument | null = await this.model.findById(id).populate('messages');
      if (conversation) {
        return conversation.messages as MessageDocument[];
      }
      logger.warn(`No conversation found with id: ${id}`);
      return null;
    } catch (error) {
      logger.error(`Error fetching messages by conversation id: ${id}`);
      throw error;
    }
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

  async findByConversationStatus(conversationStatus: ConversationStatus): Promise<ConversationDocument[] | null> {
    try {
      const result = await this.model.find({ conversationStatus }).exec();
      if (result.length > 0) {
        logger.info(`Conversations found by conversation status: ${result}`);
      } else {
        logger.warn(`No conversations found by conversation status: ${conversationStatus}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding conversation by conversation status: ${conversationStatus}`);
      throw error;
    }
  }

  async findByUsedEndpoints(usedEndpoints: string[]): Promise<ConversationDocument[] | null> {
    try {
      const result = await this.model.find({ usedEndpoints }).exec();
      if (result.length > 0) {
        logger.info(`Conversations found by used endpoints: ${result}`);
      } else {
        logger.warn(`No conversations found by used endpoints: ${usedEndpoints}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding conversation by used endpoints: ${usedEndpoints}`);
      throw error;
    }
  }
}

export { ConversationRepository };
