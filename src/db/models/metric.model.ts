import { Schema, Document, model } from 'mongoose';
import { MetricNameEnum } from 'db/enum/enums';

interface MetricDocument extends Document {
  name: MetricNameEnum;
  value: number;
  rawValue: number; // not normalized value
  weight: number;
}

const MetricSchema: Schema = new Schema<MetricDocument>(
  {
    name: { type: String, enum: Object.values(MetricNameEnum), required: true },
    value: { type: Number, required: true },
    rawValue: { type: Number, required: true },
    weight: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const MetricModel = model<MetricDocument>('Metric', MetricSchema);

export { MetricModel, MetricDocument, MetricNameEnum };
