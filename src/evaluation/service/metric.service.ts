import { MsgSender } from '@simulation/db/enum/enums';
import { MessageDocument } from '@simulation/db/models/message.model';
import { MetricRepository } from 'evaluation/db/repositories/metric.repository';
import { MetricDocument, MetricModel } from 'evaluation/db/models/metric.model';
import { MetricNameEnum, metricWeightMap } from 'evaluation/utils/metric.config';
import mongoose from 'mongoose';
import { ConversationDocument } from '@simulation/db/models/conversation.model';
import { metricNormalizationFunctions } from 'evaluation/utils/data.normalization';
import { similarityHandler, sentimentHandler, recoveryHandler } from './evaluation.python-wrapper';

const metricRepository = new MetricRepository(MetricModel);

/**
 * calculates all metrics
 * @param messages - messages of conversation which should be evaluated
 * @param usedEndpoints - used endpoints of conversation which should be evaluated
 * @throws if values are missing in one of the maps metricCalculationFunctions, metricNormalizationFunctions and metricWeightMap
 * @returns the generated metric documents
 */
async function calculateAllMetrics(conversation: ConversationDocument): Promise<MetricDocument[]> {
  const messages = (await conversation.populate('messages')).messages as MessageDocument[];

  const promises = Object.values(MetricNameEnum).map((metricName) => {
    const calculationFunction = metricCalculationFunctions.get(metricName);
    const normalizeFunction = metricNormalizationFunctions.get(metricName);
    if (!calculationFunction || !normalizeFunction) {
      throw new Error(
        `ERROR: metric: missing entry for ${metricName} in metricCalculationFunctions or metricNormalizationFunctions`,
      );
    }
    const score = normalizeFunction(calculationFunction(messages, conversation.usedEndpoints));
    return initialize(metricName, score);
  });

  return await Promise.all(promises);
}

/**
 *
 * @param metricName - name of the metric which is initialized
 * @param score - score (between 0 and 1) that was achieved in the specified metric
 * @throws if a value is missing in metricWeightMap
 * @returns the created metric document
 */
async function initialize(metricName: MetricNameEnum, score: number) {
  const weight = metricWeightMap.get(metricName);
  if (!weight) {
    throw new Error(`ERROR: metric: missing entry for ${metricName} in metricWeightMap`);
  }
  return await metricRepository.create({
    name: metricName,
    value: score,
    weight: weight,
  });
}

const metricCalculationFunctions = new Map<
  MetricNameEnum,
  (messages: MessageDocument[], usedEndpoints: string[]) => number
>([
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [MetricNameEnum.SUCCESS, (_messages: MessageDocument[], _usedEndpoints: string[]) => 1],
  [MetricNameEnum.RESPONSE_TIME, calculateAverageResponseTime],
  [MetricNameEnum.MESSAGE_COUNT, countSteps],
  [MetricNameEnum.SIMILARITY, calculateSimilarity],
  [MetricNameEnum.RECOVERY_RATE, calculateRecoveryRate],
  [MetricNameEnum.SENTIMENT_ANALYSIS, calculateSentimentAnalysis],
]);

/**
 * Counts the number of messages in a conversation.
 * @param conversation - The conversation to count the messages of.
 * @returns Number of messages in the conversation.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, require-jsdoc
function countSteps(messages: MessageDocument[], _usedEndpoints: string[]) {
  return messages.length;
}

/**
 * Calculates the average response time of the agent in a conversation.
 * @param conversation - The conversation to calculate the average response time of.
 * @returns Average response time of the agent in the conversation.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, require-jsdoc
function calculateAverageResponseTime(messages: MessageDocument[], _usedEndpoints: string[]) {
  if (messages.length < 2) {
    return 0;
  }

  let totalResponseTimeOfAgent = 0;
  let countAgentMessages = 0;

  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];

    // Only calculate response time for agent messages
    if (!(currentMessage instanceof mongoose.Types.ObjectId) && currentMessage.sender === MsgSender.USER) {
      continue;
    }

    const prevMessage = messages[i - 1];
    const responseTime = currentMessage.timestamp.getTime() - prevMessage.timestamp.getTime();
    totalResponseTimeOfAgent += responseTime;
    countAgentMessages++;
  }

  const averageResponseTime = totalResponseTimeOfAgent / countAgentMessages;
  return averageResponseTime;
}

/**
 * Calculates the average similarity of the agent messages in a conversation.
 * @param messages - The messages to calculate the similarity for.
 * @param _usedEndpoints - The used endpoints from the conversation.
 * @returns Similarity score of all agent messages.
 */
function calculateSimilarity(messages: MessageDocument[], _usedEndpoints: string[]) {
  return similarityHandler(messages);
}

/**
 * Calculates the average recovery rate after response timeouts of the agent in a conversation.
 * @param messages - The messages to calculate the recovery rate for.
 * @param _usedEndpoints - The used endpoints from the conversation.
 * @returns Recovery rate of the agent.
 */
function calculateRecoveryRate(messages: MessageDocument[], _usedEndpoints: string[]) {
  return recoveryHandler(messages);
}

/**
 * Calculates the average polarity of the agent in a conversation (negative or positive tone)
 * @param messages - The messages to calculate the sentiment for.
 * @param _usedEndpoints - The used endpoints from the conversation.
 * @returns Sentiment polarity of the agent.
 */
function calculateSentimentAnalysis(messages: MessageDocument[], _usedEndpoints: string[]) {
  return sentimentHandler(messages);
}
export { calculateAllMetrics };
