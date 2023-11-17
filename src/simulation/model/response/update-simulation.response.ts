import { SimulationDocument } from '@simulation/db/models/simulation.model';

interface UpdateSimulationResponse {
  object: SimulationDocument;
  success: boolean;
}

export { UpdateSimulationResponse };
