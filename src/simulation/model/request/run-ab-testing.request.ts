import { SimulationType } from '@enums/simulation-type.enum';
import { SimulationScenario } from '@enums/simulation-scenario.enum';

import { AgentDocument } from '@db/models/agent.model';

interface RunABTestingRequest {
  scenario: SimulationScenario;
  type: SimulationType;
  name: string;
  description: string;
  numConversations: number;
  serviceAgent1Id?: string;
  serviceAgent2Id?: string;
  userAgentId?: string;
  serviceAgent1Config?: AgentDocument;
  serviceAgent2Config?: AgentDocument;
  userAgentConfig?: AgentDocument;
}

export { RunABTestingRequest };
