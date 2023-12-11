import { AgentDocument } from '@db/models/agent.model';

interface RunABTestingRequest {
  name: string;
  description: string;
  numConversations: number;
  serviceAgentAId?: string;
  serviceAgentBId?: string;
  userAgentId?: string;
  serviceAgentAConfig?: AgentDocument;
  serviceAgentBConfig?: AgentDocument;
  userAgentConfig?: AgentDocument;
}

export { RunABTestingRequest };
