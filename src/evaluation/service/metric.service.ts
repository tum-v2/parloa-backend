import { MsgSender, MsgTypes } from '@simulation/db/enum/enums';
import { MessageDocument } from '@simulation/db/models/message.model';
import { MetricRepository } from 'evaluation/db/repositories/metric.repository';
import { MetricDocument, MetricModel } from 'evaluation/db/models/metric.model';
import { MetricNameEnum, metricWeightMap } from 'evaluation/utils/metric.config';
import mongoose, { Types } from 'mongoose';
import { ConversationDocument } from '@simulation/db/models/conversation.model';
import { metricNormalizationFunctions } from 'evaluation/utils/data.normalization';

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
    const unnormalizedScore = calculationFunction(messages, conversation.usedEndpoints);
    const score = normalizeFunction(unnormalizedScore);
    return initialize(metricName, score, unnormalizedScore);
  });

  return await Promise.all(promises);
}

/**
 * Calculates the weighted average score
 * @param metrics - metric documents
 * @param useRawValue - whether to calculate average over rawValue or over normalized value
 * @returns weighted average over the scores of all metrics
 */
function calculateWeightedAverage(metrics: MetricDocument[], useRawValue: boolean = false): number {
  return metrics.reduce<number>((accumulator: number, metric: MetricDocument | Types.ObjectId) => {
    const metricDocument = metric as MetricDocument;
    return accumulator + metricDocument.weight * (useRawValue ? metricDocument.rawValue : metricDocument.value);
  }, 0);
}

/**
 * Calculates the equal (classical) average score
 * @param metrics - metric documents
 * @param useRawValue - whether to calculate average over rawValue or over normalized value
 * @returns equal overage over the scores of all metrics
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
 * Initializes a new metric document in the database
 * @param metricName - name of the metric which is initialized
 * @param score - score (between 0 and 1) that was achieved in the specified metric
 * @param rawValue - not normalized score that was achieved
 * @throws if a value is missing in metricWeightMap
 * @returns the created metric document
 */
async function initialize(metricName: MetricNameEnum, score: number, rawValue: number) {
  const weight = metricWeightMap.get(metricName);
  if (!weight) {
    throw new Error(`ERROR: metric: missing entry for ${metricName} in metricWeightMap`);
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
]);

/**
 * Evaluates whether the user's concern was fulfilled or not
 * @param messages - The messages of the conversation
 * @param _usedEndpoints - (unused) The endpoints that were called during the conversation
 * @returns 1 if the user's concern was fulfilled and 0 if not
 */
function goalFulfilled(
  messages: MessageDocument[],
  _usedEndpoints: string[] /* eslint-disable-line @typescript-eslint/no-unused-vars*/,
) {
  const result: boolean = messages.length > 0 && messages[messages.length - 1].type == MsgTypes.HANGUP;
  return Number(result);
}

/**
 * Calculates the number of steps per used endpoint.
 * @param messages - The messages of the conversation
 * @param usedEndpoints - The endpoints that were called during the conversation
 * @returns Number of steps per used endpoint.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, require-jsdoc
function countSteps(messages: MessageDocument[], usedEndpoints: string[]) {
  return messages.length / usedEndpoints.length;
}

/**
 * Calculates the average response time of the agent in a conversation.
 * @param messages - The messages of the conversation
 * @param _usedEndpoints - (unused) The endpoints that were called during the conversation
 * @returns Average response time of the agent in the conversation.
 */
function calculateAverageResponseTime(
  messages: MessageDocument[],
  _usedEndpoints: string[] /* eslint-disable-line @typescript-eslint/no-unused-vars*/,
) {
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

export default { initialize, calculateAllMetrics, calculateWeightedAverage, calculateEqualAverage };
