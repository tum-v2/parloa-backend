import { SimulationDocument } from '@db/models/simulation.model';
import { SimulationSuccessGraphItem } from '../type/simulation-success-graph-item';

interface DashboardData {
  interactions: number;
  simulationRuns: number;
  successRate: number;
  simulationSuccessGraph: SimulationSuccessGraphItem[];
  top10Simulations: Partial<SimulationDocument>[];
}

export default DashboardData;
