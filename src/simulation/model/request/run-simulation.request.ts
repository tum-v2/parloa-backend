import { SimulationType, SimulationScenario } from '../../db/enum/enums';

interface RunSimulationRequest {
  scenario: SimulationScenario;
  type: SimulationType;
  name: string;
  description: string;
  numConversations: number;
  serviceAgentId: string;
  userAgentId: string;
}

export { RunSimulationRequest };
