import { Schema, Document, model, Types } from 'mongoose';
import { AgentDocument } from './agent.model';
import { ConversationDocument } from './conversation.model';
import { SimulationType, SimulationStatus, SimulationScenario } from '../enum/enums';
import { EvaluationDocument } from 'evaluation/db/models/evaluation.model';

interface SimulationDocument extends Document {
  scenario: SimulationScenario;
  type: SimulationType;
  name: string;
  description: string;
  userAgent: AgentDocument | Types.ObjectId;
  serviceAgent: AgentDocument | Types.ObjectId;
  numConversations: number;
  conversations: Types.ObjectId[] | ConversationDocument[];
  status: SimulationStatus;
  evaluation: EvaluationDocument | Types.ObjectId;
}

const SimulationSchema: Schema = new Schema(
  {
    scenario: { type: String, enum: Object.values(SimulationScenario), required: true },
    type: { type: String, enum: Object.values(SimulationType), required: true },
    name: { type: String, required: true },
    description: { type: String },
    numConversations: { type: Number, required: true },
    userAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    serviceAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    conversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }],
    status: { type: String, enum: Object.values(SimulationStatus), required: true },
    evaluation: { type: Schema.Types.ObjectId, ref: 'Evaluation' },
  },
  {
    timestamps: true,
  },
);

const SimulationModel = model<SimulationDocument>('Simulation', SimulationSchema);

export { SimulationModel, SimulationDocument };
