import { Schema, Document, model } from 'mongoose';

interface ConversationDocument extends Document {
  startTime: Date;
}

const conversationSchema: Schema = new Schema({
  startTime: { type: Date, required: true, default: Date.now },
});

const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema);

export { ConversationModel, ConversationDocument };
