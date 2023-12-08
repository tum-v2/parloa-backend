import { Schema, Document, model, Types } from 'mongoose';
import { MessageDocument } from 'db/models/message.model';
import { ConversationStatus } from 'db/enum/enums';
import { EvaluationDocument } from 'db/models/evaluation.model';

interface ConversationDocument extends Document {
  messages: Types.ObjectId[] | MessageDocument[];
  startTime: Date;
  endTime: Date;
  status: ConversationStatus;
  usedEndpoints: string[];
  evaluation: Types.ObjectId | EvaluationDocument;
}

const conversationSchema: Schema = new Schema({
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: Object.values(ConversationStatus), required: true },
  usedEndpoints: { type: [String], default: [] },
  evaluation: { type: Schema.Types.ObjectId, ref: 'Evaluation' },
});

const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema);

export { ConversationModel, ConversationDocument };
