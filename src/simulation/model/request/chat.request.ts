import { AgentDocument } from '@db/models/agent.model';
import { Types } from 'mongoose';

interface StartChatRequest {
  name: string;
  agentId?: Types.ObjectId;
  agentConfig?: AgentDocument;
}

export { StartChatRequest };
