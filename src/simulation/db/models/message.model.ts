import { MsgTypes } from '../enum/enums';
import { Schema, Document, model } from 'mongoose';
import { MsgSender } from '../enum/enums';

interface MessageDocument extends Document {
  sender: MsgSender;
  text: string;
  type: MsgTypes;
  intermediateMsg: string | null;
  action: string | null;
  toolInput: Record<string, any> | null;
}

const messageSchema: Schema = new Schema(
  {
    sender: { type: String, enum: Object.values(MsgSender), required: true },
    text: { type: String, required: true },
    type: { type: String, enum: Object.values(MsgTypes), required: true },
    intermediateMsg: { type: String },
    action: { type: String },
    toolInput: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

const MessageModel = model<MessageDocument>('Message', messageSchema);

export { MessageModel, MessageDocument };
