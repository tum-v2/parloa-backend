import { MsgType } from '@enums/msg-type.enum';
import { Schema, Document, model } from 'mongoose';
import { MsgSender } from '@enums/msg-sender.enum';
import { BaseMessage } from 'langchain/schema';

interface MessageDocument extends Document {
  sender: MsgSender;
  text: string;
  type: MsgType;
  timestamp: Date;
  intermediateMsg: string | null;
  action: string | null;
  toolInput: Record<string, any> | null;
  lcMsg: BaseMessage;
  userInput: string | null;
  msgToUser: string | null;
  toolOutput: any | null;
  parentId: string | null;
}

const messageSchema: Schema = new Schema(
  {
    sender: { type: String, enum: Object.values(MsgSender), required: true },
    text: { type: String, required: true },
    type: { type: String, enum: Object.values(MsgType), required: true },
    timestamp: { type: Date, required: true },
    intermediateMsg: { type: String },
    action: { type: String },
    toolInput: { type: Schema.Types.Mixed },
    lcMsg: { type: Schema.Types.Mixed, ref: 'BaseMessage' },
    userInput: { type: String },
    msgToUser: { type: String },
    toolOutput: { type: Schema.Types.Mixed },
    parentId: { type: String },
  },
  { timestamps: true },
);

const MessageModel = model<MessageDocument>('Message', messageSchema);

export { MessageModel, MessageDocument };
