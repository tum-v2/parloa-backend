import { SimulationDocument } from '@db/models/simulation.model';
import { ConversationDocument } from '@db/models/conversation.model';
import { AgentDocument } from '@db/models/agent.model';
import repositoryFactory from '@db/repositories/factory';

import { SimulationType } from '@enums/simulation-type.enum';
import { SimulationStatus } from '@enums/simulation-status.enum';

import { RunSimulationRequest } from '@simulation/model/request/simulation.request';
import { RunEvaluationRequest } from '@evaluation/model/request/run-evaluation.request';
import { RunABTestingRequest } from '@simulation/model/request/run-ab-testing.request';
import DashboardData from '@simulation/model/response/dashboard.response';
import { runConversation } from '@simulation/service/conversation.service';
import optimizationService from '@simulation/service/optimization.service';

import evaluationService from '@evaluation/service/evaluation.service';

import { Types } from 'mongoose';

const agentRepository = repositoryFactory.agentRepository;
const simulationRepository = repositoryFactory.simulationRepository;
const conversationRepository = repositoryFactory.conversationRepository;
const messageRepository = repositoryFactory.messageRepository;

/**
 * Creates a simulation object and initiates the simulation.
 * @param request - The simulation configuration.
 * @param optimization - The optimization ID (optional).
 * @param child - Indicates if the simulation is a child simulation (optional).
 * @returns A promise that resolves to the simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function initiate(
  request: RunSimulationRequest,
  optimization: string | null = null,
  child: boolean = false,
): Promise<SimulationDocument> {
  console.log('Simulation initiated...');
  console.log('Configuration:', request);

  let userAgent: AgentDocument | null = null;
  let serviceAgent: AgentDocument | null = null;
  console.log('Creating simulation object...');
  if (request.serviceAgentConfig !== undefined) {
    serviceAgent = await agentRepository.create(request.serviceAgentConfig!);
  } else if (request.serviceAgentId !== undefined) {
    serviceAgent = await agentRepository.getById(request.serviceAgentId!);
  }
  if (request.userAgentConfig !== undefined) {
    userAgent = await agentRepository.create(request.userAgentConfig!);
  } else if (request.userAgentId !== undefined) {
    userAgent = await agentRepository.getById(request.userAgentId!);
  }

  if (userAgent === null || serviceAgent === null) {
    throw new Error('User agent or service agent id not found');
  }

  const simulationData: Partial<SimulationDocument> = {
    scenario: request.scenario,
    type: request.type,
    name: request.name,
    userAgent: userAgent,
    serviceAgent: serviceAgent,
    numConversations: request.numConversations,
    conversations: [],
    status: SimulationStatus.SCHEDULED,
  };

  if (!child && optimization !== null) {
    simulationData.optimization = new Types.ObjectId(optimization);
  }

  const simulation = await simulationRepository.create(simulationData);
  console.log(simulation);

  run(simulation, request, serviceAgent, userAgent, optimization);

  return simulation;
}

/**
 * Creates a simulation object and initiates the simulation.
 * @param request - The simulation configuration.
 * @returns A promise that resolves to a simulation[].
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function initiateAB(request: RunABTestingRequest): Promise<SimulationDocument[]> {
  console.log('Simulation initiated...');
  console.log('Configuration:', request);

  let userAgent: AgentDocument | null = null;
  let serviceAgent1: AgentDocument | null = null;
  let serviceAgent2: AgentDocument | null = null;
  console.log('Creating simulation object...');

  if (request.serviceAgent1Config !== undefined) {
    serviceAgent1 = await agentRepository.create(request.serviceAgent1Config!);
  } else if (request.serviceAgent1Id !== undefined) {
    serviceAgent1 = await agentRepository.getById(request.serviceAgent1Id!);
  }
  if (request.serviceAgent2Config !== undefined) {
    serviceAgent2 = await agentRepository.create(request.serviceAgent2Config!);
  } else if (request.serviceAgent2Id !== undefined) {
    serviceAgent2 = await agentRepository.getById(request.serviceAgent2Id!);
  }
  if (request.userAgentConfig !== undefined) {
    userAgent = await agentRepository.create(request.userAgentConfig!);
  } else if (request.userAgentId !== undefined) {
    userAgent = await agentRepository.getById(request.userAgentId!);
  }

  if (userAgent === null || serviceAgent1 === null || serviceAgent2 === null) {
    throw new Error('User agent or service agent id not found');
  }

  const simulationData1: Partial<SimulationDocument> = {
    scenario: request.scenario,
    type: SimulationType.AB_TESTING,
    name: request.name,
    userAgent: userAgent,
    serviceAgent: serviceAgent1,
    numConversations: request.numConversations,
    conversations: [],
    status: SimulationStatus.SCHEDULED,
  };
  const simulation1: SimulationDocument = await simulationRepository.create(simulationData1);

  const simulationData2: Partial<SimulationDocument> = {
    scenario: request.scenario,
    type: SimulationType.AB_TESTING,
    name: request.name,
    userAgent: userAgent,
    serviceAgent: serviceAgent2,
    numConversations: request.numConversations,
    conversations: [],
    status: SimulationStatus.SCHEDULED,
    abPartner: simulation1._id,
  };
  const simulation2: SimulationDocument = await simulationRepository.create(simulationData2);

  simulation1.abPartner = simulation2._id;
  await simulationRepository.updateById(simulation1._id, simulation1);

  runAB(simulation1, simulation2, request, serviceAgent1, serviceAgent2, userAgent);

  return [simulation1, simulation2];
}

/**
 * Runs a simulation. This function runs conversations for the simulation and then runs evaluations for each conversation.
 * For the last conversation, it sends a flag to the evaluation service to indicate that this is the last conversation.
 * It waits for the evaluation services answer for the last conversation.
 * If the simulation is an optimization simulation, it calls the optimization service to handle the simulation over.
 * @param simulation - The simulation object.
 * @param request - The simulation configuration.
 * @param serviceAgent - The service agent.
 * @param userAgent - The user agent.
 * @param optimization - The optimization ID (optional).
 */
async function run(
  simulation: SimulationDocument,
  request: RunSimulationRequest,
  serviceAgent: AgentDocument,
  userAgent: AgentDocument,
  optimization: string | null,
) {
  const conversations: Types.ObjectId[] = [];

  const numConversations = request.numConversations;
  if (numConversations <= 0 || numConversations > 2) {
    throw new Error(
      'Number of conversations must be between 1 and 2 (just for now so nobody miss clicks and runs 100 conversations which would cost a lot of money))',
    );
  }
  simulation.status = SimulationStatus.RUNNING;
  await simulationRepository.updateById(simulation._id, simulation);
  const simulationStart = new Date();
  for (let i = 0; i < numConversations; i++) {
    const conversation: any = await runConversation(serviceAgent, userAgent);
    conversations.push(conversation);
    simulation.conversations = conversations;
    await simulationRepository.updateById(simulation._id, simulation);
  }
  const simulationEnd = new Date();
  simulation.duration = (simulationEnd.getTime() - simulationStart.getTime()) / 1000;
  simulation.status = SimulationStatus.FINISHED;
  await simulationRepository.updateById(simulation._id, simulation);

  for (let i = 0; i < conversations.length; i++) {
    const evaluationRequest: RunEvaluationRequest = {
      conversation: conversations[i].toString(),
      simulation: simulation._id,
      isLast: false,
      optimization: optimization,
    };

    if (i === numConversations - 1) {
      evaluationRequest.isLast = true;
      await evaluationService.runEvaluation(evaluationRequest);
      if (optimization !== null) {
        optimizationService.handleSimulationOver(optimization);
      }
    } else {
      evaluationService.runEvaluation(evaluationRequest);
    }
  }
}

/**
 * Starts two simulations for AB testing.
 * @param simulation1 - The first simulation object.
 * @param simulation2 - The second simulation object.
 * @param request - The simulation configuration.
 * @param serviceAgent1 - The first service agent.
 * @param serviceAgent2 - The second service agent.
 * @param userAgent - The user agent.
 */
async function runAB(
  simulation1: SimulationDocument,
  simulation2: SimulationDocument,
  request: RunSimulationRequest,
  serviceAgent1: AgentDocument,
  serviceAgent2: AgentDocument,
  userAgent: AgentDocument,
) {
  await run(simulation1, request, serviceAgent1, userAgent, null);
  await run(simulation2, request, serviceAgent2, userAgent, null);
}
//

/**
 * Retrieves a simulation object with populated agent, and conversation fields.
 * @param id - The ID of the simulation object to retrieve.
 * @returns A promise that resolves to the simulation object with populated references, or null if not found.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function poll(id: string): Promise<SimulationDocument | null> {
  return simulationRepository.findById(id);
}

/**
 * Retrieves conversations in a simulation object.
 * @param id - The ID of the simulation object to retrieve.
 * @returns A promise that resolves to the conversation object list.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function getConversations(id: string): Promise<ConversationDocument[] | null> {
  return await simulationRepository.getConversationsById(id);
}

/**
 * Fetches all simulations.
 * @returns A promise that resolves to simulation object list.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function getAll(): Promise<SimulationDocument[]> {
  const simulations: SimulationDocument[] = await simulationRepository.findAllParentSimulations();
  return simulations;
}

/**
 * Fetches a conversation with messages.
 * @param id - The ID of the conversation to retrieve.
 * @returns A promise that resolves to the conversation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
export async function getConversation(id: string): Promise<any | null> {
  const conversation: ConversationDocument | null = await conversationRepository.getMessages(id);
  if (conversation) {
    const modifiedConversation: any = {};
    const messages: any[] = [];
    for (const messageId of conversation.messages) {
      const message: any = await messageRepository.getById(messageId as unknown as string);
      if (message.sender === 'TOOL') {
        continue;
      }
      const modifiedMessage: any = {};
      modifiedMessage.sender = message.sender;
      modifiedMessage.text = message.text;
      modifiedMessage.timestamp = message.timestamp;
      modifiedMessage.userCanReply = true;
      messages.push(modifiedMessage);
    }
    modifiedConversation._id = conversation.id;
    modifiedConversation.startTime = conversation.startTime;
    modifiedConversation.endTime = conversation.endTime;
    modifiedConversation.status = conversation.status;
    modifiedConversation.messages = messages;
    return modifiedConversation;
  }
}

/**
 * Updates the simulation object.
 * @param id - The ID of the simulation object to update.
 * @param updates - The updates to apply to the simulation object.
 * @returns A promise that resolves to the updated simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function update(id: string, updates: Partial<SimulationDocument>): Promise<SimulationDocument | null> {
  return await simulationRepository.updateById(id, updates);
}

/**
 * Deletes the simulation object.
 * @param id - The ID of the simulation object to update.
 * @returns A promise that resolves to the updated simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function del(id: string): Promise<boolean> {
  return await simulationRepository.deleteById(id);
}

/**
 * Returns dashboard data.
 * @param days - The number of days to look back.
 * @returns A promise that resolves to dashboard data.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function getDashboardData(days: number): Promise<DashboardData> {
  const totalInteractions: number = await _getTotalInteractions(days);
  const simulationRuns: number = await _getSimulationRuns(days);
  const avgSuccessRate: number = await _getAverageSuccessRate(days);
  const simulationSuccessGraph: Partial<SimulationDocument>[] = await _getSimulationSuccessGraph(days);
  const top10Simulations: Partial<SimulationDocument>[] = await _getTop10Simulations(days);
  const data: DashboardData = {
    interactions: totalInteractions,
    simulationRuns: simulationRuns,
    successRate: avgSuccessRate,
    simulationSuccessGraph: simulationSuccessGraph,
    top10Simulations: top10Simulations,
  };
  return data;
}

/**
 * Returns the total number of interactions in all simulations.
 * @param days - The number of days to look back.
 * @returns A promise that resolves to the number of interactions.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function _getTotalInteractions(days: number): Promise<number> {
  return await simulationRepository.getTotalInteractions(days);
}

/**
 * Returns the total number of simulations run.
 * @param days - The number of days to look back.
 * @returns A promise that resolves to the number of simulations run.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function _getSimulationRuns(days: number): Promise<number> {
  return await simulationRepository.getSimulationRuns(days);
}

/**
 * Returns the average success rate of all simulations.
 * @param days - The number of days to look back.
 * @returns A promise that resolves to the average success rate.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function _getAverageSuccessRate(days: number): Promise<number> {
  return await simulationRepository.getAverageSuccessRate(days);
}

/**
 * Returns the success rate of all simulations.
 * @param days - The number of days to look back.
 * @returns A promise that resolves to the success rate.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function _getSimulationSuccessGraph(days: number): Promise<Partial<SimulationDocument>[]> {
  return await simulationRepository.getSimulationSuccessGraph(days);
}

/**
 * Returns the top 10 simulations.
 * @param days - The number of days to look back.
 * @returns A promise that resolves to the top 10 simulations.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function _getTop10Simulations(days: number): Promise<Partial<SimulationDocument>[]> {
  return await simulationRepository.getTop10Simulations(days);
}

export default {
  initiate,
  initiateAB,
  poll,
  getConversations,
  getAll,
  getConversation,
  update,
  del,
  getDashboardData,
};
