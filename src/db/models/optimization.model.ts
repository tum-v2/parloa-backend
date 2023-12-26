import { Schema, Document, model, ObjectId, CallbackError } from 'mongoose';
import { SimulationModel } from '@db/models/simulation.model';
import { ChildSimulationRepresentation } from '@simulation/model/type/child-simulation-representation';
import { SimulationStatus } from '@enums/simulation-status.enum';

interface OptimizationDocument extends Document {
  optimizationId: string;
  iteration: number;
  baseSimulation: ObjectId;
  simulations: ChildSimulationRepresentation[];
  maxIterations: number;
  highestScoringChildSimulationId: ObjectId;
}

// Schema that represent the ChildSimulationRepresentation
const childSimulationSchema = new Schema({
  simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation' },
  status: { type: String, enum: Object.values(SimulationStatus), required: true },
});

const optimizationSchema = new Schema({
  optimizationId: { type: String, required: true },
  iteration: { type: Number, required: true },
  baseSimulation: { type: Schema.Types.ObjectId, ref: 'Simulation', default: null },
  simulations: [childSimulationSchema],
  maxIterations: { type: Number, required: true },
  highestScoringChildSimulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: false, default: null },
});

// Unique compound index
optimizationSchema.index({ optimizationId: 1, iteration: 1 }, { unique: true });

//TODO might be wrong, take a look afterwards
optimizationSchema.pre('findOneAndDelete', async function (next) {
  try {
    const optimization = await OptimizationModel.findById(this.getFilter()['_id']).exec();

    if (optimization && optimization.simulations) {
      // Extracting simulationId from each ChildSimulationRepresentation
      const simulationIds = optimization.simulations.map((sim) => sim.simulationId);

      // Delete simulations based on extracted simulationIds
      await SimulationModel.deleteMany({ _id: { $in: simulationIds } }).exec();
    }

    next();
  } catch (error) {
    console.log(error);
    next(error as CallbackError);
  }
});

const OptimizationModel = model<OptimizationDocument>('Optimization', optimizationSchema);

export { OptimizationModel, OptimizationDocument };
