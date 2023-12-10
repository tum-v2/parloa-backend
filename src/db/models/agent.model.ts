import { Schema, Document, model } from 'mongoose';
import { ConversationDomain } from '@enums/conversation-domain.enum';
import { LLMModel } from '@enums/llm-model.enum';

interface AgentDocument extends Document {
  name: string;
  llm: LLMModel;
  temperature: number;
  maxTokens: number;
  domain: ConversationDomain;
  prompt: string;
}

const agentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    llm: { type: String, enum: Object.values(LLMModel), required: true },
    temperature: { type: Number, required: true },
    maxTokens: { type: Number, required: true },
    domain: { type: String, enum: Object.values(ConversationDomain), required: true },
    prompt: { type: String, required: true },
  },
  { timestamps: true },
);

const AgentModel = model<AgentDocument>('Agent', agentSchema);

export { AgentModel, AgentDocument };
