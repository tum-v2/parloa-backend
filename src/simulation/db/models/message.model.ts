import { Schema, Document, model, Types } from 'mongoose';
import { AgentModel } from './agent.model';

interface MessageDocument extends Document {
  sender: Types.ObjectId | typeof AgentModel;
  text: string;
}

const messageSchema: Schema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const MessageModel = model<MessageDocument>('Message', messageSchema);

export { MessageModel, MessageDocument };
