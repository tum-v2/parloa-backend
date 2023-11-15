// Agent config model class that frontend will input

import Simulation from './simulation';

interface DashboardData {
  interactions: number;
  simulationRuns: number;
  successRate: number;
  simulationSuccessGraph: GraphData;
  top10Simulations: Simulation[];
}
interface GraphData {}

export default DashboardData;
