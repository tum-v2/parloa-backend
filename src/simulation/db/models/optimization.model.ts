import { Schema, Document, model, Types } from 'mongoose';
import { SimulationDocument } from '@simulation/db/models/simulation.model';

interface OptimizationDocument extends Document {
  optimizationId: string;
  simulationIds: Types.ObjectId[] | SimulationDocument[];
}

const optimizationSchema = new Schema({
  simulationIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Simulation',
    },
  ],
});

const OptimizationModel = model<OptimizationDocument>('Optimization', optimizationSchema);

export { OptimizationModel, OptimizationDocument };
