import { SimulationDocument } from '@simulation/db/models/simulation.model';

interface DashboardData {
  interactions: number;
  simulationRuns: number;
  successRate: number;
  simulationSuccessGraph: Partial<SimulationDocument>[];
  top10Simulations: Partial<SimulationDocument>[];
}

export default DashboardData;
