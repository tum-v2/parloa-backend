import { Schema, Document, model, Types } from 'mongoose';
import { UserDocument } from './user.model';
import { AgentDocument } from './agent.model';
import { ConversationDocument } from './conversation.model';
import { ConversationType, ConversationDomain, SimulationStatus, SimulationScenario } from '../enum/enums';

interface SimulationDocument extends Document {
  user: Types.ObjectId | UserDocument;
  scenario: SimulationScenario;
  type: ConversationType;
  domain: ConversationDomain;
  name: string;
  userAgent: Types.ObjectId | AgentDocument;
  serviceAgent: Types.ObjectId | AgentDocument;
  numConversations: number;
  conversations: Types.ObjectId[] | ConversationDocument[];
  status: SimulationStatus;
}

const SimulationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scenario: { type: String, enum: Object.values(SimulationScenario), required: true },
    type: { type: String, enum: Object.values(ConversationType), required: true },
    domain: { type: String, enum: Object.values(ConversationDomain), required: true },
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
