import { Schema, Document, model, ObjectId } from 'mongoose';
import { SimulationDocument } from 'db/models/simulation.model';

interface OptimizationDocument extends Document {
  baseSimulation: ObjectId;
  simulations: ObjectId[] | SimulationDocument[];
}

const optimizationSchema = new Schema({
  baseSimulation: { type: Schema.Types.ObjectId, ref: 'Simulation', default: null },
  simulations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Simulation',
    },
  ],
});

const OptimizationModel = model<OptimizationDocument>('Optimization', optimizationSchema);

export { OptimizationModel, OptimizationDocument };
