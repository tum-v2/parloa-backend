import { Schema, Document, model, ObjectId, CallbackError } from 'mongoose';
import { SimulationDocument, SimulationModel } from '@db/models/simulation.model';

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

optimizationSchema.pre<OptimizationDocument>('findOneAndDelete', async function (next) {
  try {
    const optimization = await OptimizationModel.findOne(this.getFilter()).exec();
    await SimulationModel.deleteMany({ _id: { $in: optimization?.simulations } }).exec();
    next();
  } catch (error) {
    console.log(error);
    next(error as CallbackError);
  }
});

const OptimizationModel = model<OptimizationDocument>('Optimization', optimizationSchema);

export { OptimizationModel, OptimizationDocument };
