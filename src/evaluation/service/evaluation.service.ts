import { ConversationDocument, ConversationModel } from '@db/models/conversation.model';
import { SimulationDocument, SimulationModel } from '@db/models/simulation.model';
import { EvaluationDocument, EvaluationDocumentWithConversation, EvaluationModel } from '@db/models/evaluation.model';
import { MetricDocument, MetricNameEnum } from '@db/models/metric.model';
import { EvaluationRepository } from '@db/repositories/evaluation.repository';
import { ConversationRepository } from '@db/repositories/conversation.repository';
import { SimulationRepository } from '@db/repositories/simulation.repository';

import { RunEvaluationRequest } from '@evaluation/model/request/run-evaluation.request';
import { RunEvaluationResponse } from '@evaluation/model/response/run-evaluation.response';

import metricService from '@evaluation/service/metric.service';

import { EvaluationStatus } from '@enums/evaluation-status.enum';

import simulationService from '@simulation/service/simulation.service';
import EvaluationResultForConversation, {
  EvaluationExecuted,
} from '@evaluation/model/response/results-for-conversation.response';
import EvaluationResultForSimulation from '@evaluation/model/response/results-for-simulation.response';

const evaluationRepository = new EvaluationRepository(EvaluationModel);
const conversationRepository = new ConversationRepository(ConversationModel);
const simulationRepository = new SimulationRepository(SimulationModel);

/**
 * Triggers the evaluation of one conversation.
 * @param request - Configuration object (type RunEvaluationRequest).
 * @throws Error -  When simulation with the given ID is not found.
 * @throws Error - When conversation with given ID is not found.
 * @throws Error - When a given conversation is not part of the given simulation.
 * @returns RunEvaluationResponse - RunEvaluationResponse object including the created evaluation ID.
 */
async function runEvaluation(request: RunEvaluationRequest): Promise<RunEvaluationResponse> {
  const conversationID: string = request.conversation;
  const simulationID: string = request.simulation;
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
    optimization: request.optimization || null,
    simulation: simulationID,
    evaluation: evaluation.id,
  };
  return responseObject;
}

/**
 * Creates an evaluation object and initiates the evaluation of the conversation.
 * @param request - The evaluation configuration.
 * @param conversation - The conversation which will be evaluated.
 * @param simulation - The simulation which the conversation belongs to.
 * @returns EvaluationDocument -  created evaluation object
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
    successRate: metricService.calculateWeightedAverage(metrics),
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
 * @param simulation - Simulation which should be evaluated.
 * @returns EvaluationDocument -  The created evaluation document.
 */
async function runEvaluationForSimulation(simulation: SimulationDocument): Promise<EvaluationDocument> {
  const conversationEvaluations = await evaluationRepository.findConversationEvaluationsBySimulation(simulation.id);
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
 * Retrieves the evaluation result for the specified conversation.
 * @param conversation - Conversation document.
 * @returns EvaluationResultForConversation - Evaluation results for the given conversation.
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
 * Retrieves the evaluation result for all conversations of the specified simulation.
 * @param simulation - Simulation document.
 * @returns EvaluationResultForSimulation -  Evaluation results for the given simulation.
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

  const evaluationOfSimulation = await (simulation.evaluation as EvaluationDocument).populate('metrics');
  const averageScore = getExecuteEvaluationResults(evaluationOfSimulation);

  return {
    status: EvaluationStatus.EVALUATED,
    averageScore: averageScore,
    conversations: conversationScores,
  };
}

/**
 * Retrieves the evaluation results for the specified evaluation.
 * @param evaluation - Evaluation document.
 * @returns EvaluationResultForConversation -  Evaluation results for the given evaluation document.
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
 * Retrieves the evaluation results for the specified evaluation. The evaluation is known to already have been executed.
 * @param evaluation - Evaluation document.
 * @returns EvaluationExecuted -  Evaluation results.
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

export default { initiate, getResultsForConversation, getResultsForSimulation, runEvaluation };
