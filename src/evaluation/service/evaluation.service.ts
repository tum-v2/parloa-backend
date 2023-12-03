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
 * Creates an evaluation object and initiates the evaluation of the conversation
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

  let evaluation = await evaluationRepository.create({
    simulation: simulation,
    conversation: conversation,
    metrics: [],
    successRate: 0,
  });

  const metrics = await metricService.calculateAllMetrics(conversation);

  evaluation = (await evaluationRepository.updateById(evaluation.id, {
    metrics: metrics,
    successRate: metricService.calculateAverageScore(metrics),
  })) as EvaluationDocument;
  console.log(evaluation);
  await conversationRepository.saveEvaluation(conversation.id, evaluation.id);

  if (request.isLast) {
    const evaluationOfSimulation = await runEvaluationForSimulation(simulation);
    console.log(evaluationOfSimulation);
    await simulationRepository.saveEvaluation(simulation.id, evaluationOfSimulation.id);
  }

  return evaluation;
}

/**
 * Runs the evaluation for a simulation and stores the result in the database
 * @param simulation - simulation which should be evaluated
 * @returns the created evaluation document
 */
async function runEvaluationForSimulation(simulation: SimulationDocument): Promise<EvaluationDocument> {
  const conversationEvaluations = await evaluationRepository.findConversationEvaluationsBySimulation(simulation.id);
  const allMetrics: MetricDocument[] = conversationEvaluations.map((c) => c.metrics).flat() as MetricDocument[];

  const promises: Promise<MetricDocument>[] = Object.values(MetricNameEnum).map((metricName) => {
    const value = metricService.calculateAverageScore(allMetrics.filter((metric) => metric.name === metricName));

    return metricService.initialize(metricName, value);
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
  const evaluation: EvaluationDocument | null = (await conversation.populate('evaluation'))
    .evaluation as EvaluationDocument | null;
  if (!evaluation) {
    return {
      status: EvaluationStatus.NOT_EVALUATED,
    };
  }

  return getEvaluationResults(evaluation);
}

/**
 * Retrieves the evaluation result for all conversations of the specified simulation
 * @param simulation - simulation document
 * @returns the evaluation results
 */
async function getResultsForSimulation(simulation: SimulationDocument): Promise<EvaluationResultForSimulation> {
  const evaluations: EvaluationDocumentWithConversation[] =
    await evaluationRepository.findConversationEvaluationsBySimulation(simulation.id);
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

  const averageScore = getExecuteEvaluationResults(simulation.evaluation as EvaluationDocument);

  return {
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
      const { name, value, weight } = metric as MetricDocument;
      return { name, value, weight };
    }),
  };
}

export default { initiate, getResultsForConversation, getResultsForSimulation, runEvaluation };
