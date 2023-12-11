import { SimulationType } from '@enums/simulation-type.enum';

import { AgentDocument } from '@db/models/agent.model';

interface RunSimulationRequest {
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
