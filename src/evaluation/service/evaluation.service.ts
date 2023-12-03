// Evaluation-specific functionality called by controllers or other services

import { ConversationDocument } from '@simulation/db/models/conversation.model';
import { SimulationDocument } from '@simulation/db/models/simulation.model';
import { EvaluationDocument, EvaluationModel } from 'evaluation/db/models/evaluation.model';
import { EvaluationRepository } from 'evaluation/db/repositories/evaluation.repository';
import { RunEvaluationRequest } from 'evaluation/model/request/run-evaluation.request';
import { calculateAllMetrics } from './metric.service';
import { MetricDocument } from 'evaluation/db/models/metric.model';
import { Types } from 'mongoose';
import {
  EvaluationExecuted,
  EvaluationResultForConversation,
  EvaluationResultForSimulation,
  EvaluationStatus,
} from 'evaluation/model/request/evaluation-result.response';

const evaluationRepository = new EvaluationRepository(EvaluationModel);

/**
 * Creates an evaluation object and initiates the evaluation of the conversation and - if request.optimization is true and this is the last conversation of the simulation - also the optimization
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
  });

  const metrics = await calculateAllMetrics(conversation);

  evaluation = (await evaluationRepository.updateById(evaluation.id, {
    metrics: metrics,
  })) as EvaluationDocument;
  console.log(evaluation);

  return evaluation;
}

/**
 * Retrieves the evaluation result for the specified conversation
 * @param conversation - conversation document
 * @returns the evaluation results
 */
async function getResultsForConversation(conversation: ConversationDocument): Promise<EvaluationResultForConversation> {
  const evaluation: EvaluationDocument | null = await evaluationRepository.findByConversation(conversation.id);
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
  const evaluations: EvaluationDocument[] = await evaluationRepository.findBySimulation(simulation.id);
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

  const sumOfScores = conversationScores.reduce<number>(
    (accumulator: number, current) => accumulator + current.score,
    0,
  );

  return {
    averageScore: conversationScores.length > 0 ? sumOfScores / conversationScores.length : 0,
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

  const overallScore = evaluation.metrics.reduce<number>(
    (accumulator: number, metric: MetricDocument | Types.ObjectId) => {
      const metricDocument = metric as MetricDocument;
      return accumulator + metricDocument.weight * metricDocument.value;
    },
    0,
  );

  return {
    status: EvaluationStatus.EVALUATED,
    score: overallScore,
    metrics: evaluation.metrics.map((metric) => {
      const { name, value, weight } = metric as MetricDocument;
      return { name, value, weight };
    }),
  };
}

export default { initiate, getResultsForConversation, getResultsForSimulation };
