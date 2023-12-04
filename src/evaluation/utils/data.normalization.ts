import { MetricNameEnum } from './metric.config';

const metricNormalizationFunctions: Map<MetricNameEnum, (score: number) => number> = new Map([
  [MetricNameEnum.SUCCESS, normalizeSuccessScore],
  [MetricNameEnum.RESPONSE_TIME, normalizeResponseTime],
  [MetricNameEnum.MESSAGE_COUNT, normalizeMessageCount],
]);

/**
 *
 * @param score - the (not normalized) score
 * @param minScore - the score which is considered the best (normalized score will be 1)
 * @param maxScore - the score which is considered the worst (normalized score will be 0)
 * @returns the normalized score (using the min-max-normalizer)
 */
function minMaxNormalize(score: number, minScore: number, maxScore: number) {
  return (score - minScore) / (maxScore - minScore);
}

/**
 * Normalizes the success metric
 * @param success - C-style boolean whether conversation was successfull
 * @returns 1 if conversation was successfull, 0 if not
 */
function normalizeSuccessScore(success: number) {
  return Number(success != 0);
}

/**
 * Normalizes the response time
 * @param responseTime - response time
 * @returns normalized response time (score between 0 and 1; the higher, the better)
 */
function normalizeResponseTime(responseTime: number) {
  return minMaxNormalize(responseTime, 60_000, 0);
}

/**
 * Normalizes the message count metric
 * @param numberOfMessages - number of messages
 * @returns normalized message count score (between 0 and 1; the higher, the better)
 */
function normalizeMessageCount(numberOfMessages: number) {
  return minMaxNormalize(numberOfMessages, 10, 0);
}

export { metricNormalizationFunctions };
