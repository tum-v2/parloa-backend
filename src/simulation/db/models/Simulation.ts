import { Schema, Document, model, Types } from 'mongoose';
import { UserModel } from './User'; // Import your User model
import { AgentModel } from './Agent'; // Import your Agent model

interface SimulationDocument extends Document {
  user: Types.ObjectId | typeof UserModel;
  scenarioName: string;
  conversationType: string;
  conversationDomain: string;
  agents: Types.ObjectId[] | (typeof AgentModel)[];
  conversations: string[];
}

const SimulationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scenarioName: { type: String, required: true },
    conversationType: { type: String, required: true },
    conversationDomain: { type: String, required: true },
    agents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
    conversations: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

const SimulationModel = model<SimulationDocument>('Simulation', SimulationSchema);

export { SimulationModel, SimulationDocument };
