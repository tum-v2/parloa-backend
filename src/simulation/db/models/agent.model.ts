import { Schema, Document, model } from 'mongoose';
import { LLMModel } from '../enum/enums';

interface AgentDocument extends Document {
  modelName: LLMModel;
  temperature: number;
  maxTokens: number;
  prompt: string;
}

const agentSchema: Schema = new Schema(
  {
    modelName: { type: String, enum: Object.values(LLMModel), required: true },
    temperature: { type: Number, required: true },
    maxTokens: { type: Number, required: true },
    prompt: { type: String, required: true },
  },
  { timestamps: true },
);

const AgentModel = model<AgentDocument>('Agent', agentSchema);

export { AgentModel, AgentDocument };
