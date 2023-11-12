import { Model } from 'mongoose';
import { logger } from '../../service/logging-service';
import { BaseRepository } from './base.repository';
import { MessageDocument } from '../models/message.model';

class MessageRepository extends BaseRepository<MessageDocument> {
  constructor(model: Model<MessageDocument>) {
    super(model);
  }

  async findBySender(sender: string): Promise<MessageDocument[]> {
    try {
      const result = await this.model.find({ sender }).exec();
      if (result.length > 0) {
        logger.info(`Messages found by sender: ${result}`);
      } else {
        logger.warn(`No messages found by sender: ${sender}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding messages by sender: ${sender}`);
      throw error;
    }
  }
}

export { MessageRepository };
