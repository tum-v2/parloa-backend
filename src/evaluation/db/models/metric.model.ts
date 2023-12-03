import { Schema, Document, model } from 'mongoose';
import { MetricNameEnum } from '../../utils/metric.config';

interface MetricDocument extends Document {
  name: MetricNameEnum;
  value: number;
  weight: number;
}

const MetricSchema: Schema = new Schema<MetricDocument>(
  {
    name: { type: String, enum: Object.values(MetricNameEnum), required: true },
    value: { type: Number, required: true },
    weight: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const MetricModel = model<MetricDocument>('Metric', MetricSchema);

export { MetricModel, MetricDocument, MetricNameEnum };
