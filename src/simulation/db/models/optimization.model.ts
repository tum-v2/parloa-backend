import { Schema, Document, model, ObjectId } from 'mongoose';
import { SimulationDocument } from '@simulation/db/models/simulation.model';

interface OptimizationDocument extends Document {
  baseSimulation: ObjectId;
  simulationIds: ObjectId[] | SimulationDocument[];
}

const optimizationSchema = new Schema({
  baseSimulation: { type: Schema.Types.ObjectId, ref: 'Simulation' },
  simulationIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Simulation',
    },
  ],
});

const OptimizationModel = model<OptimizationDocument>('Optimization', optimizationSchema);

export { OptimizationModel, OptimizationDocument };
