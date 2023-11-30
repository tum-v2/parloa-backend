import { Schema, Document, model, Types } from 'mongoose';
import { SimulationDocument } from '../../../simulation/db/models/simulation.model';
import { ConversationDocument } from '../../../simulation/db/models/conversation.model';

enum MetricEnum {
  SUCCESS = 'success',
  RESPONSE_TIME = 'response_time',
  MESSAGE_COUNT = 'message_count',
}

interface EvaluationDocument extends Document {
  simulation: Types.ObjectId | SimulationDocument;
  conversation: Types.ObjectId | ConversationDocument;
  metrics: Map<MetricEnum, number>;
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

export { EvaluationModel, EvaluationDocument, MetricEnum };
