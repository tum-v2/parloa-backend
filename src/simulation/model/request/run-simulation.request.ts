import { ConversationType, SimulationScenario } from '../../db/enum/enums';

interface RunSimulationRequest {
  scenario: SimulationScenario;
  type: ConversationType;
  name: string;
  numConversations: number;
  serviceAgentConfig: string;
  userAgentConfig: string;
}

export { RunSimulationRequest };
