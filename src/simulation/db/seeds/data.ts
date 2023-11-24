import { connectToDatabase } from '../config/db.config';
import { logger } from '../../service/logging.service';

import { AgentModel } from '../models/agent.model';
import { AgentRepository } from '../repositories/agent.repository';
import { ConversationModel } from '../models/conversation.model';
import { ConversationRepository } from '../repositories/conversation.repository';
import { SimulationModel } from '../models/simulation.model';
import { SimulationRepository } from '../repositories/simulation.repository';

import { LLMModel, ConversationStatus, ConversationType, SimulationStatus, SimulationScenario } from '../enum/enums';

connectToDatabase();

const agentRepository = new AgentRepository(AgentModel);
const conversationRepository = new ConversationRepository(ConversationModel);
const simulationRepository = new SimulationRepository(SimulationModel);

const seedAgents = async () => {
  try {
    await agentRepository.create({
      llm: LLMModel.LLAMA2,
      temperature: 0.7,
      maxTokens: 512,
      prompt: 'prompt1',
    });

    await agentRepository.create({
      llm: LLMModel.GPT4,
      temperature: 0.9,
      maxTokens: 512,
      prompt: 'prompt2',
    });
  } catch (error) {
    logger.error('Error seeding agents:', error);
  }
};

const seedConversation = async () => {
  try {
    await conversationRepository.create({
      messages: [],
      startTime: new Date(),
      status: ConversationStatus.FINISHED,
      usedEndpoints: [],
    });
  } catch (error) {
    console.error('Error adding conversation to the database:', error);
  }
};

const seedSimulation = async () => {
  try {
    const llamaAgent = await agentRepository.findByModelName(LLMModel.LLAMA2);

    if (!llamaAgent || !llamaAgent[0]) {
      logger.warn('Llama agent not found!');
      return;
    }

    const gptAgent = await agentRepository.findByModelName(LLMModel.GPT4);

    if (!gptAgent || !gptAgent[0]) {
      logger.warn('GPT agent not found!');
      return;
    }

    const conversation = await conversationRepository.findByConversationStatus(ConversationStatus.FINISHED);

    if (!conversation || !conversation[0]) {
      logger.warn('Conversation not found!');
      return;
    }

    await simulationRepository.create({
      scenario: SimulationScenario.SEQUENCE,
      type: ConversationType.AUTOMATED,
      agents: [llamaAgent[0]._id, gptAgent[0]._id],
      conversations: [conversation[0]._id],
      status: SimulationStatus.SCHEDULED,
    });
  } catch (error) {
    logger.error('Error seeding simulation:', error);
  }
};

seedAgents();
seedConversation();
seedSimulation();
