// Evaluation-specific functionality called by controllers or other services

import { MsgSender } from '@simulation/db/enum/enums';
import { ConversationDocument } from '@simulation/db/models/conversation.model';
import { MessageDocument, MessageModel } from '@simulation/db/models/message.model';
import { SimulationDocument } from '@simulation/db/models/simulation.model';
import { EvaluationDocument, EvaluationModel, MetricEnum } from 'evaluation/db/models/evaluation.model';
import { EvaluationRepository } from 'evaluation/db/repositories/evaluation.repository';
import { RunEvaluationRequest } from 'evaluation/model/request/run-evaluation.request';
import { Types } from 'mongoose';

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

  const evaluationData: Partial<EvaluationDocument> = {
    simulation: simulation,
    conversation: conversation,
    metrics: new Map<MetricEnum, number>(),
  };

  // TODO: run actual evaluation :-)
  countSteps(conversation);
  calculateAverageResponseTime(conversation);

  if (request.isLastConversation && request.shouldOptimize) {
    // TODO: trigger optimization
  }

  const evaluation = await evaluationRepository.create(evaluationData);
  console.log(evaluation);

  return evaluation;
}

/**
 * Counts the number of messages in a conversation.
 * @param conversation - The conversation to count the messages of.
 * @returns Number of messages in the conversation.
 */
function countSteps(conversation: ConversationDocument) {
  return conversation.messages.length;
}

/**
 * Calculates the average response time of the agent in a conversation.
 * @param conversation - The conversation to calculate the average response time of.
 * @returns Average response time of the agent in the conversation.
 */
async function calculateAverageResponseTime(conversation: ConversationDocument) {
  if (conversation.messages.length < 2) {
    return 0;
  }

  let messages: MessageDocument[];

  if (Array.isArray(conversation.messages) && conversation.messages[0] instanceof MessageModel) {
    // If messages are populated, use them directly
    messages = conversation.messages as unknown as MessageDocument[];
  } else {
    // If messages are references (ObjectIds), populate them
    messages = await MessageModel.find({ _id: { $in: conversation.messages as Types.ObjectId[] } });
  }

  let totalResponseTimeOfAgent = 0;
  let countAgentMessages = 0;

  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];

    // Only calculate response time for agent messages
    if (currentMessage.sender === MsgSender.USER) {
      continue;
    }

    const prevMessage = messages[i - 1];
    const responseTime = currentMessage.createdAt.getTime() - prevMessage.createdAt.getTime();
    totalResponseTimeOfAgent += responseTime;
    countAgentMessages++;
  }

  const averageResponseTime = totalResponseTimeOfAgent / countAgentMessages;
  return averageResponseTime;
}

export default { initiate };
