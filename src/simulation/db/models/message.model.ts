import { Schema, Document, model, Types } from 'mongoose';
import { AgentModel } from './agent.model';
import { MsgTypes } from '../enum/enums';

interface MessageDocument extends Document {
  sender: Types.ObjectId | typeof AgentModel | typeof String;
  text: string;
  type: MsgTypes;
  timestamp: Date;
  intermediateMsg: string | null;
  action: string;
  toolInput: Record<string, any> | null;
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
