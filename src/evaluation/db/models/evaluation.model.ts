import { Schema, Document, model, Types } from 'mongoose';
import { SimulationDocument } from '../../../simulation/db/models/simulation.model';
import { ConversationDocument } from '../../../simulation/db/models/conversation.model';
import { MetricDocument } from './metric.model';

interface EvaluationDocument extends Document {
  simulation: Types.ObjectId | SimulationDocument;
  conversation: Types.ObjectId | ConversationDocument;
  metrics: Types.ObjectId[] | MetricDocument[];
}

const EvaluationSchema: Schema = new Schema(
  {
    simulation: { type: Types.ObjectId, ref: 'Simulation', required: true },
    conversation: { type: Types.ObjectId, ref: 'Conversation', required: true },
    metrics: [{ type: Schema.Types.ObjectId, ref: 'Metric' }],
  },
  {
    timestamps: true,
  },
);

const EvaluationModel = model<EvaluationDocument>('Evaluation', EvaluationSchema);

export { EvaluationModel, EvaluationDocument };
