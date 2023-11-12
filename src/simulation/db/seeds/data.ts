import { connectToDatabase } from '../config/index';
import { logger } from '../../service/logging-service';

import { UserModel } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { AgentModel } from '../models/Agent';
import { AgentRepository } from '../repositories/AgentRepository';
import { ConversationModel } from '../models/Conversation';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { SimulationModel } from '../models/Simulation';
import { SimulationRepository } from '../repositories/SimulationRepository';

connectToDatabase();

const userRepository = new UserRepository(UserModel);
const agentRepository = new AgentRepository(AgentModel);
const conversationRepository = new ConversationRepository(ConversationModel);
const simulationRepository = new SimulationRepository(SimulationModel);

const seedUsers = async () => {
  try {
    await userRepository.create({
      username: 'user1',
      email: 'user1@example.com',
      lastLogin: new Date(),
    });

    await userRepository.create({
      username: 'user2',
      email: 'user2@example.com',
      lastLogin: new Date(),
    });

    await userRepository.create({
      username: 'user3',
      email: 'user3@example.com',
      lastLogin: new Date(),
    });
  } catch (error) {
    logger.error('Error seeding users:', error);
  }
};

const seedAgents = async () => {
  try {
    await agentRepository.create({
      modelName: 'LLAMA2',
      version: '1.0',
      task: 'Task1',
    });

    await agentRepository.create({
      modelName: 'GPT4',
      version: '2.0',
      task: 'Task2',
    });
  } catch (error) {
    logger.error('Error seeding agents:', error);
  }
};

const seedConversation = async () => {
  try {
    await conversationRepository.create({
      startTime: new Date(),
    });
  } catch (error) {
    logger.error('Error adding conversation to the database:', error);
  }
};

const seedSimulation = async () => {
  try {
    const user = await userRepository.findByUsername('user1');

    if (!user) {
      logger.warn('User not found!');
      return;
    }

    const llamaAgent = await agentRepository.findByModelName('LLAMA2');

    if (!llamaAgent || !llamaAgent[0]) {
      logger.warn('Llama agent not found!');
      return;
    }

    const gptAgent = await agentRepository.findByModelName('GPT4');

    if (!gptAgent || !gptAgent[0]) {
      logger.warn('GPT agent not found!');
      return;
    }

    await simulationRepository.create({
      user: user._id,
      scenarioName: 'Sample Scenario',
      conversationType: 'Sequence',
      conversationDomain: 'Airline',
      agents: [llamaAgent[0]._id, gptAgent[0]._id],
      conversations: ['Conversation1', 'Conversation2'],
    });
  } catch (error) {
    logger.error('Error seeding simulation:', error);
  }
};

seedUsers();
seedAgents();
seedConversation();
seedSimulation();
