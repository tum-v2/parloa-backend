import { Schema, Document, model, Types } from 'mongoose';
import { AgentDocument } from './agent.model';
import { ConversationDocument } from './conversation.model';
import { ConversationType, SimulationStatus, SimulationScenario } from '../enum/enums';

interface SimulationDocument extends Document {
  scenario: SimulationScenario;
  type: ConversationType;
  name: string;
  userAgent: Types.ObjectId | AgentDocument;
  serviceAgent: Types.ObjectId | AgentDocument;
  numConversations: number;
  conversations: Types.ObjectId[] | ConversationDocument[];
  status: SimulationStatus;
}

const SimulationSchema: Schema = new Schema(
  {
    scenario: { type: String, enum: Object.values(SimulationScenario), required: true },
    type: { type: String, enum: Object.values(ConversationType), required: true },
    name: { type: String, required: true },
    numConversations: { type: Number, required: true },
    userAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    serviceAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    conversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }],
    status: { type: String, enum: Object.values(SimulationStatus), required: true },
  },
  {
    timestamps: true,
  },
);

const SimulationModel = model<SimulationDocument>('Simulation', SimulationSchema);

export { SimulationModel, SimulationDocument };
