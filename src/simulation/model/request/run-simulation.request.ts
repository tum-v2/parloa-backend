import { UserDocument } from '../../db/models/user.model';
import { AgentDocument } from '../../db/models/agent.model';
import { ConversationType, ConversationDomain, SimulationScenario } from '../../db/enum/enums';
import { Types } from 'mongoose';

interface RunSimulationRequest {
  user: Types.ObjectId | UserDocument;
  scenario: SimulationScenario;
  type: ConversationType;
  domain: ConversationDomain;
  name: string;
  numConversations: number;
  serviceAgentConfig: AgentDocument;
  userAgentConfig: AgentDocument;
}

export { RunSimulationRequest };
