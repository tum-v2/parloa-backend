import { Schema, Document, model, Types } from 'mongoose';
import { ConversationModel } from './Conversation'; // Import your Agent model

interface MetricDocument extends Document {
  conversation: Types.ObjectId | typeof ConversationModel;
  metricType: string;
  metricValue: number;
}

const metricSchema: Schema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    metricType: { type: String, required: true },
    metricValue: { type: Number, required: true },
  },
  { timestamps: true },
);

const MetricModel = model<MetricDocument>('Metric', metricSchema);

export { MetricModel, MetricDocument };
