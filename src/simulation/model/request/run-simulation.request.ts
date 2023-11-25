import { AgentDocument } from '../../db/models/agent.model';
import { ConversationType, SimulationScenario } from '../../db/enum/enums';

interface RunSimulationRequest {
  scenario: SimulationScenario;
  type: ConversationType;
  name: string;
  numConversations: number;
  serviceAgentConfig: AgentDocument;
  userAgentConfig: AgentDocument;
}

export { RunSimulationRequest };
