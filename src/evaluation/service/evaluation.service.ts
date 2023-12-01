// Evaluation-specific functionality called by controllers or other services

import { ConversationDocument } from '@simulation/db/models/conversation.model';
import { SimulationDocument } from '@simulation/db/models/simulation.model';
import { EvaluationDocument, EvaluationModel } from 'evaluation/db/models/evaluation.model';
import { EvaluationRepository } from 'evaluation/db/repositories/evaluation.repository';
import { RunEvaluationRequest } from 'evaluation/model/request/run-evaluation.request';
import { calculateAllMetrics } from './metric.service';

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

  const metrics = await calculateAllMetrics(conversation);

  const evaluationData: Partial<EvaluationDocument> = {
    simulation: simulation,
    conversation: conversation,
    metrics: metrics,
  };

  const evaluation = await evaluationRepository.create(evaluationData);
  console.log(evaluation);

  if (request.isLastConversation && request.shouldOptimize) {
    // TODO: trigger optimization
  }

  return evaluation;
}

export default { initiate };
