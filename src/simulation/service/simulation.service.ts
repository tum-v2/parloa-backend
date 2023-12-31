import { SimulationDocument } from '@db/models/simulation.model';
import { ConversationDocument } from '@db/models/conversation.model';
import { AgentDocument } from '@db/models/agent.model';
import { EvaluationDocument } from '@db/models/evaluation.model';
import repositoryFactory from '@db/repositories/factory';

import { SimulationType } from '@enums/simulation-type.enum';
import { SimulationStatus } from '@enums/simulation-status.enum';
import { MsgSender } from '@enums/msg-sender.enum';

import { SimulationSuccessGraphItem } from '@simulation/model/type/simulation-success-graph-item';

import { RunSimulationRequest } from '@simulation/model/request/simulation.request';
import { RunEvaluationRequest } from '@evaluation/model/request/run-evaluation.request';
import { RunABTestingRequest } from '@simulation/model/request/ab-testing.request';
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
    request.serviceAgentConfig.temporary = true;
    serviceAgent = await agentRepository.create(request.serviceAgentConfig!);
  } else if (request.serviceAgentId !== undefined) {
    serviceAgent = await agentRepository.getById(request.serviceAgentId!);
  }
  if (request.userAgentConfig !== undefined) {
    request.userAgentConfig.temporary = true;
    userAgent = await agentRepository.create(request.userAgentConfig!);
  } else if (request.userAgentId !== undefined) {
    userAgent = await agentRepository.getById(request.userAgentId!);
  }

  if (userAgent === null || serviceAgent === null) {
    throw new Error('User agent or service agent id not found');
  }

  const simulationData: Partial<SimulationDocument> = {
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

  run(simulation, request.numConversations, serviceAgent, userAgent, optimization);

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
  let serviceAgentA: AgentDocument | null = null;
  let serviceAgentB: AgentDocument | null = null;
  console.log('Creating simulation object...');

  if (request.serviceAgentAConfig !== undefined) {
    request.serviceAgentAConfig.temporary = true;
    serviceAgentA = await agentRepository.create(request.serviceAgentAConfig!);
  } else if (request.serviceAgentAId !== undefined) {
    serviceAgentA = await agentRepository.getById(request.serviceAgentAId!);
  }

  if (request.serviceAgentBConfig !== undefined) {
    request.serviceAgentBConfig.temporary = true;
    serviceAgentB = await agentRepository.create(request.serviceAgentBConfig!);
  } else if (request.serviceAgentBId !== undefined) {
    serviceAgentB = await agentRepository.getById(request.serviceAgentBId!);
  }

  if (request.userAgentConfig !== undefined) {
    request.userAgentConfig.temporary = true;
    userAgent = await agentRepository.create(request.userAgentConfig!);
  } else if (request.userAgentId !== undefined) {
    userAgent = await agentRepository.getById(request.userAgentId!);
  }

  if (userAgent === null || serviceAgentA === null || serviceAgentB === null) {
    throw new Error('User agent or service agent id not found');
  }

  const simulationDataA: Partial<SimulationDocument> = {
    type: SimulationType.AB_TESTING,
    name: request.name,
    userAgent: userAgent,
    serviceAgent: serviceAgentA,
    numConversations: request.numConversations,
    conversations: [],
    status: SimulationStatus.SCHEDULED,
  };
  const simulationA: SimulationDocument = await simulationRepository.create(simulationDataA);

  const simulationDataB: Partial<SimulationDocument> = {
    type: SimulationType.AB_TESTING,
    name: request.name,
    userAgent: userAgent,
    serviceAgent: serviceAgentB,
    numConversations: request.numConversations,
    conversations: [],
    status: SimulationStatus.SCHEDULED,
    abPartner: simulationA._id,
  };
  const simulationB: SimulationDocument = await simulationRepository.create(simulationDataB);

  simulationA.abPartner = simulationB._id;
  await simulationRepository.updateById(simulationA._id, simulationA);

  runAB(simulationA, simulationB, request.numConversations, serviceAgentA, serviceAgentB, userAgent);

  return [simulationA, simulationB];
}

/**
 * Runs a simulation. This function runs conversations for the simulation and then runs evaluations for each conversation.
 * For the last conversation, it sends a flag to the evaluation service to indicate that this is the last conversation.
 * It waits for the evaluation services answer for the last conversation.
 * If the simulation is an optimization simulation, it calls the optimization service to handle the simulation over.
 * @param simulation - The simulation object.
 * @param request - The simulation configuration.
 * @param numConversations - The number of conversations to run.
 * @param userAgent - The user agent.
 * @param optimization - The optimization ID (optional).
 */
async function run(
  simulation: SimulationDocument,
  numConversations: number,
  serviceAgent: AgentDocument,
  userAgent: AgentDocument,
  optimization: string | null,
) {
  const conversations: Types.ObjectId[] = [];

  if (numConversations <= 0 || numConversations > 2) {
    throw new Error(
      'Number of conversations must be between 1 and 2 (just for now so nobody miss clicks and runs 100 conversations which would cost a lot of money))',
    );
  }
  simulation.status = SimulationStatus.RUNNING;
  await simulationRepository.updateById(simulation._id, simulation);
  const simulationStart = new Date();

  try {
    for (let i = 0; i < numConversations; i++) {
      const conversation: ConversationDocument = await runConversation(serviceAgent, userAgent);
      conversations.push(conversation._id);
      simulation.conversations = conversations;
      simulation.totalNumberOfInteractions += await _increaseTotalNumberOfInteractions(
        simulation._id,
        conversation._id,
      );
      await simulationRepository.updateById(simulation._id, simulation);
      const evaluationRequest: RunEvaluationRequest = {
        conversation: conversation._id.toString(),
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
    const simulationEnd = new Date();
    simulation.duration = (simulationEnd.getTime() - simulationStart.getTime()) / 1000;
    simulation.status = SimulationStatus.FINISHED;
    await simulationRepository.updateById(simulation._id, simulation);
  } catch (error) {
    const simulationEnd = new Date();
    simulation.duration = (simulationEnd.getTime() - simulationStart.getTime()) / 1000;
    simulation.status = SimulationStatus.FAILED;

    await simulationRepository.updateById(simulation._id, simulation);

    if (error instanceof Error) {
      const er = error as Error;
      console.log('Catched an Error: ' + er.message + ' ' + er.stack + '\n SIMULATION FAILED!!!');
    }

    return;
  }
}

/**
 * Starts two simulations for AB testing.
 * @param simulation1 - The first simulation object.
 * @param simulation2 - The second simulation object.
 * @param numConversations - The number of conversations to run.
 * @param serviceAgentA - The first service agent.
 * @param serviceAgentB - The second service agent.
 * @param userAgent - The user agent.
 */
async function runAB(
  simulation1: SimulationDocument,
  simulation2: SimulationDocument,
  numConversations: number,
  serviceAgentA: AgentDocument,
  serviceAgentB: AgentDocument,
  userAgent: AgentDocument,
) {
  await run(simulation1, numConversations, serviceAgentA, userAgent, null);
  await run(simulation2, numConversations, serviceAgentB, userAgent, null);
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
async function getConversation(id: string): Promise<any | null> {
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
      modifiedMessage.text = message.text.replace(`${message.sender}: `, '');
      modifiedMessage.timestamp = message.timestamp;
      modifiedMessage.userCanReply = message.sender === MsgSender.AGENT;
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
 * Increases the number of interactions of a simulation by filtering the TOOL messages out of conversation.
 * @param simulationId - The ID of the simulation object to update.
 * @param conversationId - The ID of the conversation object to update.
 */
async function _increaseTotalNumberOfInteractions(simulationId: string, conversationId: string): Promise<number> {
  const conversation = await getConversation(conversationId);
  await simulationRepository.increaseTotalNumberOfInteractions(simulationId, conversation.messages.length);
  return conversation.messages.length;
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
  const simulationSuccessGraph: SimulationSuccessGraphItem[] = await _getSimulationSuccessGraph(days);
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
async function _getSimulationSuccessGraph(days: number): Promise<SimulationSuccessGraphItem[]> {
  // return raw success graph data (partial simulation document)
  // with id (ObjectId), evaluation (EvaluationDocument), and createdAt (ISODate)
  const successGraphRaw: Partial<SimulationDocument>[] = await simulationRepository.getSimulationSuccessGraph(days);

  // then, map the raw data to the SimulationSuccessGraphItem type
  // with id (ObjectId), successRate (number), and date (UNIX timestamp)
  const successGraph = successGraphRaw.map((item) => {
    return {
      id: item._id,
      // directly projecting success rate from the query is possible,
      // but then it cannot be accessed via item.successRate since item is a Partial<SimulationDocument>
      // therefore, we project evaluation and access success rate via item.evaluation.successRate
      successRate: (item.evaluation as EvaluationDocument)?.successRate,
      date: item.createdAt?.getTime(),
    } as SimulationSuccessGraphItem;
  });
  return successGraph;
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
