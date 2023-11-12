import { Schema, Document, model, Types } from 'mongoose';
import { UserModel } from './user.model'; // Import your User model

interface OptimizationDocument extends Document {
  user: Types.ObjectId | typeof UserModel;
  prompt: string;
}

const optimizationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
  },
  { timestamps: true },
);

const OptimizationModel = model<OptimizationDocument>('Optimization', optimizationSchema);

export { OptimizationModel, OptimizationDocument };
