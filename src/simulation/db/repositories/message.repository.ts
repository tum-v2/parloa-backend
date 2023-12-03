import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { MessageDocument } from '../models/message.model';

class MessageRepository extends BaseRepository<MessageDocument> {
  constructor(model: Model<MessageDocument>) {
    super(model);
  }
}

export { MessageRepository };
