import { Schema, Document, model, Types } from 'mongoose';
import { MessageModel } from './message.model';
import { ConversationStatus } from '../enum/enums';

interface ConversationDocument extends Document {
  messages: Types.ObjectId[] | (typeof MessageModel)[];
  startTime: Date;
  status: ConversationStatus;
  usedEndpoints: string[];
}

const conversationSchema: Schema = new Schema({
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  startTime: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: Object.values(ConversationStatus), required: true },
  usedEndpoints: { type: [String], default: [] },
});

const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema);

export { ConversationModel, ConversationDocument };
