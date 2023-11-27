import { SimulationType, SimulationScenario } from '../../db/enum/enums';

interface RunSimulationRequest {
  scenario: SimulationScenario;
  type: SimulationType;
  name: string;
  numConversations: number;
  serviceAgentConfig: string;
  userAgentConfig: string;
}

export { RunSimulationRequest };
