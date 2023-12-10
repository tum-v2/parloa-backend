import { SimulationType } from '@enums/simulation-type.enum';

import { AgentDocument } from '@db/models/agent.model';

interface RunABTestingRequest {
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
