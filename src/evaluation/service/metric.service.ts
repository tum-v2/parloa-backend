import { MsgSender } from '@enums/msg-sender.enum';
import { MsgType } from '@enums/msg-type.enum';
import { MetricNameEnum } from '@enums/metric-name.enum';

import { MessageDocument } from '@db/models/message.model';
import { MetricRepository } from '@db/repositories/metric.repository';
import { MetricDocument, MetricModel } from '@db/models/metric.model';
import { ConversationDocument } from '@db/models/conversation.model';
import { similarityHandler, recoveryHandler, sentimentHandler } from '@evaluation/service/evaluation.python-wrapper';

import { metricWeightMap } from '@evaluation/utils/metric.config';
import { metricNormalizationFunctions } from '@evaluation/utils/data.normalization';

import { Types } from 'mongoose';

const metricRepository = new MetricRepository(MetricModel);

/**
 * calculates all metrics
 * @param conversation - Conversation document to be calculated.
 * @throws Error - If values are missing in one of the maps metricCalculationFunctions, metricNormalizationFunctions and metricWeightMap.
 * @returns MetricDocument[] -  Generated metric documents for the given conversation.
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
    const unnormalizedScore = calculationFunction(messages, conversation.usedEndpoints);
    const score = normalizeFunction(unnormalizedScore);
    return initialize(metricName, score, unnormalizedScore);
  });

  return await Promise.all(promises);
}

/**
 * Calculates the weighted average score using given metric documents.
 * @param metrics - Metric documents.
 * @param useRawValue - Whether to calculate average over rawValue or over normalized value.
 * @returns number -  Weighted average over the scores of all metrics provided in metric documents.
 */
function calculateWeightedAverage(metrics: MetricDocument[], useRawValue: boolean = false): number {
  return metrics.reduce<number>((accumulator: number, metric: MetricDocument | Types.ObjectId) => {
    const metricDocument = metric as MetricDocument;
    return accumulator + metricDocument.weight * (useRawValue ? metricDocument.rawValue : metricDocument.value);
  }, 0);
}

/**
 * Calculates the equal (classical) average score.
 * @param metrics - Metric documents.
 * @param useRawValue - Whether to calculate average over rawValue or over normalized value.
 * @returns number - Equal overage over the scores of all metrics.
 */
function calculateEqualAverage(metrics: MetricDocument[], useRawValue: boolean = false): number {
  if (metrics.length == 0) return 0;

  const sumOfScores = metrics.reduce<number>((accumulator: number, metric: MetricDocument | Types.ObjectId) => {
    const metricDocument = metric as MetricDocument;
    return accumulator + (useRawValue ? metricDocument.rawValue : metricDocument.value);
  }, 0);
  return sumOfScores / metrics.length;
}

/**
 * Initializes a new metric document in the database.
 * @param metricName - Name of the metric which is initialized.
 * @param score - Score (between 0 and 1) that was achieved in the specified metric.
 * @param rawValue - Not normalized score that was achieved.
 * @throws Error - If a value is missing in metricWeightMap.
 * @returns MetricDocument - Created metric document.
 */
async function initialize(metricName: MetricNameEnum, score: number, rawValue: number): Promise<MetricDocument> {
  const weight = metricWeightMap.get(metricName);
  if (!weight) {
    throw new Error(`Metric: missing entry for ${metricName} in metricWeightMap`);
  }
  return await metricRepository.create({
    name: metricName,
    value: score,
    rawValue: rawValue,
    weight: weight,
  });
}

const metricCalculationFunctions = new Map<
  MetricNameEnum,
  (messages: MessageDocument[], usedEndpoints: string[]) => number
>([
  [MetricNameEnum.SUCCESS, goalFulfilled],
  [MetricNameEnum.RESPONSE_TIME, calculateAverageResponseTime],
  [MetricNameEnum.MESSAGE_COUNT, countSteps],
  [MetricNameEnum.SIMILARITY, calculateSimilarity],
  [MetricNameEnum.RECOVERY_RATE, calculateRecoveryRate],
  [MetricNameEnum.SENTIMENT_ANALYSIS, calculateSentimentAnalysis],
]);

/**
 * Evaluates whether the user's concern was fulfilled or not.
 * @param messages - The messages of the conversation.
 * @param _usedEndpoints - (unused) The endpoints that were called during the conversation
 * @returns number -  If the user's concern was fulfilled and 0 otherwise.
 */
function goalFulfilled(
  messages: MessageDocument[],
  _usedEndpoints: string[] /* eslint-disable-line @typescript-eslint/no-unused-vars*/,
): number {
  const result: boolean = messages.length > 0 && messages[messages.length - 1].type == MsgType.HANGUP;
  return Number(result);
}

/**
 * Calculates the number of steps per used endpoint.
 * @param messages - The messages of the conversation.
 * @param usedEndpoints - The endpoints that were called during the conversation.
 * @returns number - Number of steps per used endpoint.
 */
function countSteps(messages: MessageDocument[], usedEndpoints: string[]): number {
  const filteredMessages = messages.filter((message) => message.sender !== MsgSender.TOOL); // Filter out api call messages
  return filteredMessages.length / usedEndpoints.length;
}

/**
 * Calculates the average response time of the agent in a conversation.
 * @param messages - The messages of the conversation.
 * @param _usedEndpoints - (unused) The endpoints that were called during the conversation.
 * @returns number - Average response time of the agent in the conversation.
 */
function calculateAverageResponseTime(
  messages: MessageDocument[],
  _usedEndpoints: string[] /* eslint-disable-line @typescript-eslint/no-unused-vars*/,
): number {
  const filteredMessages = messages.filter((message) => message.sender !== MsgSender.TOOL); // Filter out api call messages

  if (filteredMessages.length < 2) {
    return 0;
  }

  let totalResponseTimeOfAgent = 0;
  let countAgentMessages = 0;

  for (let i = 1; i < filteredMessages.length; i++) {
    const currentMessage = filteredMessages[i];

    // Only calculate response time for agent messages
    if (currentMessage.sender === MsgSender.USER) {
      continue;
    }

    const prevMessage = filteredMessages[i - 1];
    const responseTime = currentMessage.timestamp.getTime() - prevMessage.timestamp.getTime();
    totalResponseTimeOfAgent += responseTime;
    countAgentMessages++;
  }

  return totalResponseTimeOfAgent / countAgentMessages;
}

/**
 * Calculates the average similarity of the agent messages in a conversation.
 * @param messages - The messages to calculate the similarity for.
 * @param _usedEndpoints - The used endpoints from the conversation.
 * @returns Similarity score of all agent messages.
 */
function calculateSimilarity(
  messages: MessageDocument[],
  _usedEndpoints: string[] /* eslint-disable-line @typescript-eslint/no-unused-vars*/,
): number {
  return similarityHandler(messages);
}

/**
 * Calculates the average recovery rate after response timeouts of the agent in a conversation.
 * @param messages - The messages to calculate the recovery rate for.
 * @param _usedEndpoints - The used endpoints from the conversation.
 * @returns Recovery rate of the agent.
 */
function calculateRecoveryRate(
  messages: MessageDocument[],
  _usedEndpoints: string[] /* eslint-disable-line @typescript-eslint/no-unused-vars*/,
) {
  return recoveryHandler(messages);
}

/**
 * Calculates the average polarity of the agent in a conversation (negative or positive tone)
 * @param messages - The messages to calculate the sentiment for.
 * @param _usedEndpoints - The used endpoints from the conversation.
 * @returns Sentiment polarity of the agent.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, require-jsdoc
function calculateSentimentAnalysis(
  messages: MessageDocument[],
  _usedEndpoints: string[] /* eslint-disable-line @typescript-eslint/no-unused-vars*/,
) {
  return sentimentHandler(messages);
}

export default { initialize, calculateAllMetrics, calculateWeightedAverage, calculateEqualAverage };
