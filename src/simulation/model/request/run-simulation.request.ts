import { SimulationType, SimulationScenario } from '../../db/enum/enums';
import { AgentDocument } from '@simulation/db/models/agent.model';

interface RunSimulationRequest {
  scenario: SimulationScenario;
  type: SimulationType;
  name: string;
  description: string;
  numConversations: number;
  serviceAgentId?: string;
  userAgentId?: string;
  serviceAgentConfig?: AgentDocument;
  userAgentConfig?: AgentDocument;
}

export { RunSimulationRequest };
