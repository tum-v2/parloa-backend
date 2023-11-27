import { Schema, Document, model } from 'mongoose';

interface OptimizationDocument extends Document {
  prompt: string;
}

const optimizationSchema: Schema = new Schema(
  {
    prompt: { type: String, required: true },
  },
  { timestamps: true },
);

const OptimizationModel = model<OptimizationDocument>('Optimization', optimizationSchema);

export { OptimizationModel, OptimizationDocument };
