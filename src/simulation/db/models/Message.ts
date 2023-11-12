import { Schema, Document, model } from 'mongoose';

interface MessageDocument extends Document {
  sender: string;
  text: string;
}

const messageSchema: Schema = new Schema(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const MessageModel = model<MessageDocument>('Message', messageSchema);

export { MessageModel, MessageDocument };
