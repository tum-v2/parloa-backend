import { MsgTypes } from '../enum/enums';
import { Schema, Document, model } from 'mongoose';
import { MsgSender } from '../enum/enums';

interface MessageDocument extends Document {
  sender: MsgSender;
  text: string;
  type: MsgTypes;
  timestamp: Date;
  intermediateMsg: string | null;
  action: string;
  toolInput: Record<string, any> | null;
}

const messageSchema: Schema = new Schema(
  {
    sender: { type: String, enum: Object.values(MsgSender), required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const MessageModel = model<MessageDocument>('Message', messageSchema);

export { MessageModel, MessageDocument };
