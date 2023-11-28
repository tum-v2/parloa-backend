// Evaluation-specific functionality called by controllers or other services

import { MessageDocument, MessageModel } from '../../simulation/db/models/message.model';
import { ConversationDocument, ConversationModel } from '../../simulation/db/models/conversation.model';
import { Types } from 'mongoose';
import { MsgSender } from '../../simulation/db/enum/enums';
import { EvaluationModel } from '../db/models/evaluation.model';

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

async function runEvaluation(conversationId: string, simulationId: string) {
  const conversation = await ConversationModel.findById(conversationId).populate('messages');
  if (!conversation) {
    throw new Error(`Conversation with id ${conversationId} not found`);
  }

  const numSteps = countSteps(conversation);
  const averageResponseTime = await calculateAverageResponseTime(conversation);

  const evaluation = await EvaluationModel.create({
    simulation: simulationId,
    conversation: conversationId,
    metrics: {
      message_count: numSteps,
      response_time: averageResponseTime,
    },
  });
  return evaluation;
}

export default {
  runEvaluation,
};
