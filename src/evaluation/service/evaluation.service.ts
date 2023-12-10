// Evaluation-specific functionality called by controllers or other services

import { ConversationDocument, ConversationModel } from '@simulation/db/models/conversation.model';
import { SimulationDocument, SimulationModel } from '@simulation/db/models/simulation.model';
import {
  EvaluationDocument,
  EvaluationDocumentWithConversation,
  EvaluationModel,
} from 'evaluation/db/models/evaluation.model';
import { EvaluationRepository } from 'evaluation/db/repositories/evaluation.repository';
import { RunEvaluationRequest } from 'evaluation/model/request/run-evaluation.request';
import metricService from './metric.service';
import { MetricDocument, MetricNameEnum } from 'evaluation/db/models/metric.model';
import {
  EvaluationExecuted,
  EvaluationResultForConversation,
  EvaluationResultForSimulation,
  EvaluationStatus,
} from 'evaluation/model/request/evaluation-result.response';
import { ConversationRepository } from '@simulation/db/repositories/conversation.repository';
import { SimulationRepository } from '@simulation/db/repositories/simulation.repository';
import simulationService from '@simulation/service/simulation.service';
import { RunEvaluationResponse } from 'evaluation/model/request/run-evaluation.response';
import { RerunEvaluationRequest } from 'evaluation/model/request/rerun-evaluation.request';
import { RerunEvaluationResponse } from 'evaluation/model/request/rerun-evaluation.response';

const evaluationRepository = new EvaluationRepository(EvaluationModel);
const conversationRepository = new ConversationRepository(ConversationModel);
const simulationRepository = new SimulationRepository(SimulationModel);

/**
 * Triggers the evaluation of one conversation
 * @param request - configuration object (type RunEvaluationRequest)
 * @returns an RunEvaluationResponse object including the created evaluation object
 */
async function runEvaluation(request: RunEvaluationRequest): Promise<RunEvaluationResponse> {
  const conversationID = request.conversation;
  const simulationID = request.simulation;
  const conversation: ConversationDocument | null = await conversationRepository.getById(conversationID);
  if (!conversation) {
    throw new Error(`Conversation ${conversationID} not found!`);
  }

  const simulation: SimulationDocument | null = await simulationService.poll(simulationID);

  if (!simulation) {
    throw new Error(`Simulation ${simulationID} not found!`);
  } else if (!simulation.conversations.find((c) => c.toString() === conversationID)) {
    throw new Error(`Conversation ${conversationID} does not belong to Simulation ${simulationID}`);
  }

  const evaluation: EvaluationDocument = await initiate(request, conversation, simulation);
  const responseObject: RunEvaluationResponse = {
    optimization: request.optimization,
    simulation: simulationID,
    evaluation: evaluation.id,
  };
  return responseObject;
}

/**
 * Initiates the evaluation of the conversation
 * @param request - The evaluation configuration
 * @param conversation - The conversation which will be evaluated
 * @param simulation - The simulation which the conversation belongs to.
 * @throws Throws an error if there is an issue with the MongoDB query.
 * @returns The created evaluation object
 */
async function initiate(
  request: RunEvaluationRequest,
  conversation: ConversationDocument,
  simulation: SimulationDocument,
): Promise<EvaluationDocument> {
  console.log('Evaluation initiated...');
  console.log('Configuration:', request);
  console.log('Creating evaluation object');

  const evaluation = await createEvaluation(simulation, conversation);

  await conversationRepository.saveEvaluation(conversation.id, evaluation.id);

  if (request.isLast === true) {
    const evaluationOfSimulation = await runEvaluationForSimulation(simulation);
    console.log(evaluationOfSimulation);
    await simulationRepository.saveEvaluation(simulation.id, evaluationOfSimulation.id);
  }

  return evaluation;
}

/**
 * Creates an evaluation object for the specified conversation
 * @param simulation - simulation which should be evaluated
 * @param conversation - conversation which should be evaluated
 * @returns the created evaluation document
 */
async function createEvaluation(
  simulation: SimulationDocument,
  conversation: ConversationDocument,
): Promise<EvaluationDocument> {
  let evaluation = await evaluationRepository.create({
    simulation: simulation,
    conversation: conversation,
    metrics: [],
    successRate: 0,
  });

  const metrics = await metricService.calculateAllMetrics(conversation);

  evaluation = (await evaluationRepository.updateById(evaluation.id, {
    metrics: metrics,
    successRate: metricService.calculateWeightedAverage(metrics),
  })) as EvaluationDocument;
  console.log(evaluation);
  return evaluation;
}

/**
 * Runs the evaluation for a simulation and stores the result in the database
 * @param simulation - simulation which should be evaluated
 * @returns the created evaluation document
 */
async function runEvaluationForSimulation(simulation: SimulationDocument): Promise<EvaluationDocument> {
  const conversationEvaluations = await evaluationRepository.findConversationEvaluationsBySimulation(simulation);
  const allMetrics: MetricDocument[] = conversationEvaluations.map((c) => c.metrics).flat() as MetricDocument[];

  const promises: Promise<MetricDocument>[] = Object.values(MetricNameEnum).map((metricName) => {
    const filteredMetrics = allMetrics.filter((metric) => metric.name === metricName);
    const value = metricService.calculateEqualAverage(filteredMetrics);
    const rawValue = metricService.calculateEqualAverage(filteredMetrics, true);

    return metricService.initialize(metricName, value, rawValue);
  });

  const sumOfScores = conversationEvaluations.reduce<number>((acc, evaluation) => acc + evaluation.successRate, 0);

  return await evaluationRepository.create({
    simulation: simulation,
    conversation: null,
    metrics: await Promise.all(promises),
    successRate: sumOfScores / conversationEvaluations.length,
  });
}

/**
 * Retrieves the evaluation result for the specified conversation
 * @param conversation - conversation document
 * @returns the evaluation results
 */
async function getResultsForConversation(conversation: ConversationDocument): Promise<EvaluationResultForConversation> {
  let evaluation: EvaluationDocument | null = (await conversation.populate('evaluation'))
    .evaluation as EvaluationDocument | null;
  if (!evaluation) {
    return {
      status: EvaluationStatus.NOT_EVALUATED,
    };
  }

  evaluation = await evaluation.populate('metrics');
  return getEvaluationResults(evaluation);
}

/**
 * Retrieves the evaluation result for all conversations of the specified simulation
 * @param simulation - simulation document
 * @returns the evaluation results
 */
async function getResultsForSimulation(simulation: SimulationDocument): Promise<EvaluationResultForSimulation> {
  const evaluations: EvaluationDocumentWithConversation[] =
    await evaluationRepository.findConversationEvaluationsBySimulation(simulation);
  const conversationScores = evaluations
    .map((evaluation) => {
      return {
        conversationId: evaluation.conversation.toString(),
        evaluationResults: getEvaluationResults(evaluation),
      };
    })
    .filter(
      (evaluations): evaluations is { conversationId: string; evaluationResults: EvaluationExecuted } =>
        evaluations.evaluationResults.status == EvaluationStatus.EVALUATED,
    )
    .map(({ conversationId, evaluationResults }) => {
      const { score, metrics } = evaluationResults;
      return {
        conversation: conversationId,
        score,
        metrics,
      };
    });

  const evaluationOfSimulation = await (simulation.evaluation as EvaluationDocument).populate('metrics');
  const averageScore = getExecuteEvaluationResults(evaluationOfSimulation);

  return {
    status: EvaluationStatus.EVALUATED,
    averageScore: averageScore,
    conversations: conversationScores,
  };
}

/**
 * retrieves the evaluation results for the specified evaluation
 * @param evaluation - evaluation document
 * @returns the evaluation results
 */
function getEvaluationResults(evaluation: EvaluationDocument): EvaluationResultForConversation {
  if (evaluation.metrics.length == 0) {
    return {
      status: EvaluationStatus.IN_PROGRESS,
    };
  }

  return {
    ...getExecuteEvaluationResults(evaluation),
    status: EvaluationStatus.EVALUATED,
  };
}

/**
 * retrieves the evaluation results for the specified evaluation. The evaluation is known to already have been executed.
 * @param evaluation - evaluation document
 * @returns the evaluation results
 */
function getExecuteEvaluationResults(evaluation: EvaluationDocument): Omit<EvaluationExecuted, 'status'> {
  return {
    score: evaluation.successRate,
    metrics: evaluation.metrics.map((metric) => {
      const { name, value, rawValue, weight } = metric as MetricDocument;
      return { name, value, rawValue, weight };
    }),
  };
}

/**
 * Triggers the re-evaluation of one conversation
 * @param request - configuration object (type RerunEvaluationRequest)
 * @returns an RerunEvaluationResponse object including the created evaluation object
 */
async function rerunEvaluation(request: RerunEvaluationRequest): Promise<RerunEvaluationResponse> {
  const conversationID = request.conversation;
  const simulationID = request.simulation;
  const conversation: ConversationDocument | null = await conversationRepository.getById(conversationID);
  if (!conversation) {
    throw new Error(`Conversation ${conversationID} not found!`);
  }

  const simulation: SimulationDocument | null = await simulationService.poll(simulationID);

  if (!simulation) {
    throw new Error(`Simulation ${simulationID} not found!`);
  } else if (!simulation.conversations.find((c) => c.toString() === conversationID)) {
    throw new Error(`Conversation ${conversationID} does not belong to Simulation ${simulationID}`);
  }

  console.log('Re-Evaluation initiated...');
  console.log('Configuration:', request);
  console.log('Creating re-evaluation object');
  const evaluation: EvaluationDocument = await createEvaluation(simulation, conversation);
  const responseObject: RerunEvaluationResponse = {
    simulation: simulationID,
    evaluation: evaluation.id,
  };
  return responseObject;
}

export default { initiate, getResultsForConversation, getResultsForSimulation, runEvaluation, rerunEvaluation };
