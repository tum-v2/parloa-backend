import { Schema, Document, model, Types, CallbackError } from 'mongoose';
import { MessageDocument, MessageModel } from '@db/models/message.model';
import { ConversationStatus } from '@enums/conversation-status.enum';
import { EvaluationDocument, EvaluationModel } from '@db/models/evaluation.model';

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

conversationSchema.pre('deleteMany', async function (next) {
  try {
    const conversation = await ConversationModel.findById(this.getFilter()['_id']).exec();
    await MessageModel.deleteMany({ _id: { $in: conversation?.messages } }).exec();
    if (conversation?.evaluation) {
      await EvaluationModel.findByIdAndDelete(conversation.evaluation).exec();
    }
    next();
  } catch (error) {
    console.log(error);
    next(error as CallbackError);
  }
});

const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema);

export { ConversationModel, ConversationDocument };
