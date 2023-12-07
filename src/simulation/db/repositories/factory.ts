import { AgentModel } from '@simulation/db/models/agent.model';
import { SimulationModel } from '@simulation/db/models/simulation.model';
import { MessageModel } from '@simulation/db/models/message.model';
import { ConversationModel } from '@simulation/db/models/conversation.model';

import { AgentRepository } from '@simulation/db/repositories/agent.repository';
import { SimulationRepository } from '@simulation/db/repositories/simulation.repository';
import { ChatRepository } from '@simulation/db/repositories/chat.repository';
import { MessageRepository } from '@simulation/db/repositories/message.repository';
import { ConversationRepository } from '@simulation/db/repositories/conversation.repository';
import { OptimizationRepository } from '@simulation/db/repositories/optimization.repository';
import { OptimizationModel } from '@simulation/db/models/optimization.model';

export default {
  agentRepository: new AgentRepository(AgentModel),
  simulationRepository: new SimulationRepository(SimulationModel),
  chatRepository: new ChatRepository(SimulationModel, MessageModel, ConversationModel),
  messageRepository: new MessageRepository(MessageModel),
  conversationRepository: new ConversationRepository(ConversationModel),
  optimizationRepository: new OptimizationRepository(OptimizationModel),
};
