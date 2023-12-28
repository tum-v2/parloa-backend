import { AgentModel } from '@db/models/agent.model';
import { SimulationModel } from '@db/models/simulation.model';
import { MessageModel } from '@db/models/message.model';
import { ConversationModel } from '@db/models/conversation.model';
import { OptimizationModel } from '@db/models/optimization.model';
import { GoalModel } from '@db/models/goal.model';

import { AgentRepository } from '@db/repositories/agent.repository';
import { SimulationRepository } from '@db/repositories/simulation.repository';
import { ChatRepository } from '@db/repositories/chat.repository';
import { MessageRepository } from '@db/repositories/message.repository';
import { ConversationRepository } from '@db/repositories/conversation.repository';
import { OptimizationRepository } from '@db/repositories/optimization.repository';
import { GoalRepository } from '@db/repositories/goal.repository';

export default {
  agentRepository: new AgentRepository(AgentModel),
  simulationRepository: new SimulationRepository(SimulationModel),
  chatRepository: new ChatRepository(SimulationModel, MessageModel, ConversationModel),
  messageRepository: new MessageRepository(MessageModel),
  conversationRepository: new ConversationRepository(ConversationModel),
  optimizationRepository: new OptimizationRepository(OptimizationModel),
  goalRepository: new GoalRepository(GoalModel),
};
