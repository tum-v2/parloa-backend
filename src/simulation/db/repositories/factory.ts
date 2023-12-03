import { AgentModel } from '../models/agent.model';
import { SimulationModel } from '../models/simulation.model';
import { MessageModel } from '../models/message.model';
import { ConversationModel } from '../models/conversation.model';

import { AgentRepository } from './agent.repository';
import { SimulationRepository } from './simulation.repository';
import { ChatRepository } from './chat.repository';
import { MessageRepository } from './message.repository';
import { ConversationRepository } from './conversation.repository';
import { OptimizationRepository } from '@simulation/db/repositories/optimization.repository';
import { OptimizationModel } from '@simulation/db/models/optimization.model';

export default {
  agentRepository: new AgentRepository(AgentModel),
  simulationRepository: new SimulationRepository(SimulationModel),
  chatRepository: new ChatRepository(SimulationModel, MessageModel, ConversationModel),
  messageRepository: new MessageRepository(MessageModel),
  conversationRepository: new ConversationRepository(ConversationModel),
  optimizationRepository: new OptimizationRepository(OptimizationModel)
};
