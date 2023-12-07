import { Schema, Document, model, Types } from 'mongoose';
import { AgentDocument } from '@simulation/db/models/agent.model';
import { ConversationDocument } from '@simulation/db/models/conversation.model';
import { SimulationType, SimulationStatus, SimulationScenario } from '@simulation/db/enum/enums';
import { EvaluationDocument } from '@evaluation/db/models/evaluation.model';
import { OptimizationDocument } from '@simulation/db/models/optimization.model';

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
  abPartner: Types.ObjectId | undefined;
  evaluation: EvaluationDocument | Types.ObjectId;
  optimization: Types.ObjectId | OptimizationDocument | null;
  //in seconds
  duration: number;
}

const SimulationSchema: Schema = new Schema(
  {
    scenario: { type: String, enum: Object.values(SimulationScenario) },
    type: { type: String, enum: Object.values(SimulationType), required: true },
    name: { type: String, required: true },
    description: { type: String },
    numConversations: { type: Number },
    userAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    serviceAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    conversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }],
    status: { type: String, enum: Object.values(SimulationStatus), required: true },
    abPartner: { type: Schema.Types.ObjectId, ref: 'Simulation' },
    evaluation: { type: Schema.Types.ObjectId, ref: 'Evaluation' },
    optimization: { type: Schema.Types.ObjectId, ref: 'Optimization', default: null },
    duration: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const SimulationModel = model<SimulationDocument>('Simulation', SimulationSchema);

export { SimulationModel, SimulationDocument };
