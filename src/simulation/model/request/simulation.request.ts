import { SimulationType } from '@enums/simulation-type.enum';
import { SimulationScenario } from '@enums/simulation-scenario.enum';

import { AgentDocument } from '@db/models/agent.model';

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
