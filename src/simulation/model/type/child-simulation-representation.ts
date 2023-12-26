import { SimulationStatus } from '@enums/simulation-status.enum';

export interface ChildSimulationRepresentation {
  simulationId: string;
  status: SimulationStatus;
}
