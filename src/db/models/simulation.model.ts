import { Schema, Document, model, Types } from 'mongoose';
import { AgentDocument } from '@db/models/agent.model';
import { ConversationDocument } from '@db/models/conversation.model';
import { SimulationType } from '@enums/simulation-type.enum';
import { EvaluationDocument } from '@db/models/evaluation.model';
import { OptimizationDocument } from '@db/models/optimization.model';
import { SimulationScenario } from '@enums/simulation-scenario.enum';
import { SimulationStatus } from '@enums/simulation-status.enum';

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
  totalNumberOfInteractions: number;
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
    totalNumberOfInteractions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const SimulationModel = model<SimulationDocument>('Simulation', SimulationSchema);

export { SimulationModel, SimulationDocument };
