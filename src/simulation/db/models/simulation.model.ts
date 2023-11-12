import { Schema, Document, model, Types } from 'mongoose';
import { UserModel } from './user.model';
import { AgentModel } from './agent.model';
import { ConversationModel } from './conversation.model';
import { ConversationType, ConversationDomain, SimulationStatus } from '../enum/enums';

interface SimulationDocument extends Document {
  user: Types.ObjectId | typeof UserModel;
  scenarioName: string;
  type: ConversationType;
  domain: ConversationDomain;
  agents: Types.ObjectId[] | (typeof AgentModel)[];
  conversations: Types.ObjectId[] | (typeof ConversationModel)[];
  simulationStatus: SimulationStatus;
}

const SimulationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scenarioName: { type: String, required: true },
    type: { type: String, enum: Object.values(ConversationType), required: true },
    domain: { type: String, enum: Object.values(ConversationDomain), required: true },
    agents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
    conversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }],
    simulationStatus: { type: String, enum: Object.values(SimulationStatus), required: true },
  },
  {
    timestamps: true,
  },
);

const SimulationModel = model<SimulationDocument>('Simulation', SimulationSchema);

export { SimulationModel, SimulationDocument };
