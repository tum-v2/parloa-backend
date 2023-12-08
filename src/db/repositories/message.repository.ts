import { Model } from 'mongoose';
import { BaseRepository } from 'db/repositories/base.repository';
import { MessageDocument } from 'db/models/message.model';

class MessageRepository extends BaseRepository<MessageDocument> {
  constructor(model: Model<MessageDocument>) {
    super(model);
  }
}

export { MessageRepository };
