// Evaluation-specific functionality called by controllers or other services

import { ConversationDocument } from '@simulation/db/models/conversation.model';
import { SimulationDocument } from '@simulation/db/models/simulation.model';
import { EvaluationDocument, EvaluationModel } from 'evaluation/db/models/evaluation.model';
import { EvaluationRepository } from 'evaluation/db/repositories/evaluation.repository';
import { RunEvaluationRequest } from 'evaluation/model/request/run-evaluation.request';
import { calculateAllMetrics } from './metric.service';
import { MetricDocument } from 'evaluation/db/models/metric.model';
import { Types } from 'mongoose';
import { EvaluationResultResponse, EvaluationStatus } from 'evaluation/model/request/evaluation-result.response';

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

  if (request.isLastConversation && request.shouldOptimize) {
    // TODO: trigger optimization
  }

  return evaluation;
}

/**
 *
 * @param conversation
 */
async function getResults(conversation: ConversationDocument): Promise<EvaluationResultResponse> {
  const evaluation: EvaluationDocument | null = await evaluationRepository.findByConversation(conversation.id);
  if (!evaluation) {
    return {
      status: EvaluationStatus.NOT_EVALUATED,
    };
  }

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

export default { initiate, getResults };
