// Agent config model class that frontend will input

import { SimulationDocument } from './simulation.model';

interface DashboardData {
  interactions: number;
  simulationRuns: number;
  successRate: number;
  simulationSuccessGraph: GraphData;
  top10Simulations: SimulationDocument[];
}
interface GraphData {}

export default DashboardData;
