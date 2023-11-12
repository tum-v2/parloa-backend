import { Schema, Document, model } from 'mongoose';

interface AgentDocument extends Document {
  modelName: string;
  version: string;
  task: string;
}

const agentSchema: Schema = new Schema(
  {
    modelName: { type: String, required: true },
    version: { type: String, required: true },
    task: { type: String, required: true },
  },
  { timestamps: true },
);

const AgentModel = model<AgentDocument>('Agent', agentSchema);

export { AgentModel, AgentDocument };
