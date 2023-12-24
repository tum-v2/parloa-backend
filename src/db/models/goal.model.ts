import { SimulationScenario } from '@enums/simulation-scenario.enum';
import { Document, Schema, model } from 'mongoose';

interface GoalDocument extends Document {
  name: string;
  description: string;
  scenarios: SimulationScenario[];
}

const goalSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    scenarios: { type: [String], enum: Object.values(SimulationScenario) },
  },
  { timestamps: true },
);

const GoalModel = model<GoalDocument>('Goal', goalSchema);

export { GoalModel, GoalDocument };
