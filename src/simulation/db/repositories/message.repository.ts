import { Model } from 'mongoose';
import { BaseRepository } from '@simulation/db/repositories/base.repository';
import { MessageDocument } from '@simulation/db/models/message.model';

class MessageRepository extends BaseRepository<MessageDocument> {
  constructor(model: Model<MessageDocument>) {
    super(model);
  }
}

export { MessageRepository };
