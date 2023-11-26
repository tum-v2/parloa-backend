import { Schema, Document, model } from 'mongoose';
import { ConversationDomain, LLMModel } from '../enum/enums';

interface AgentDocument extends Document {
  llm: LLMModel;
  temperature: number;
  maxTokens: number;
  domain: ConversationDomain;
  prompt: string;
}

const agentSchema: Schema = new Schema(
  {
    llm: { type: String, enum: Object.values(LLMModel), required: true },
    temperature: { type: Number, required: true },
    maxTokens: { type: Number, required: true },
    domain: { type: String, enum: Object.values(ConversationDomain), required: false },
    prompt: { type: String, required: true },
  },
  { timestamps: true },
);

const AgentModel = model<AgentDocument>('Agent', agentSchema);

export { AgentModel, AgentDocument };
