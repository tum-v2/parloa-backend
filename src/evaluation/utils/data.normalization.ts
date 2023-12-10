import { MetricNameEnum } from '@enums/metric-name.enum';

const metricNormalizationFunctions: Map<MetricNameEnum, (score: number) => number> = new Map([
  [MetricNameEnum.SUCCESS, (score) => score],
  [MetricNameEnum.RESPONSE_TIME, normalizeResponseTime],
  [MetricNameEnum.MESSAGE_COUNT, normalizeMessageCount],
  [MetricNameEnum.SIMILARITY, (result) => result],
  [MetricNameEnum.RECOVERY_RATE, (result) => result],
  [MetricNameEnum.SENTIMENT_ANALYSIS, normalizeSentimentAnalysis],
]);

/**
 *
 * @param score - The (not normalized) score.
 * @param minScore - The score which is considered the best (normalized score will be 1).
 * @param maxScore - The score which is considered the worst (normalized score will be 0).
 * @returns number - The normalized score (using the min-max-normalizer).
 */
function minMaxNormalize(score: number, minScore: number, maxScore: number): number {
  return (score - minScore) / (maxScore - minScore);
}

/**
 *
 * @param score - the (not normalized) score
 * @returns the normalized score in the interval [0,1] (using the sigmoid function)
 */
function sigmoidNormalize(score: number) {
  return 1 / (1 + Math.exp(-score));
}

/**
 * Normalizes the response time.
 * @param responseTime - response time.
 * @returns number - Normalized response time (score between 0 and 1; the higher, the better).
 */
function normalizeResponseTime(responseTime: number): number {
  return minMaxNormalize(responseTime, 60_000, 0);
}

/**
 * Normalizes the message count metric.
 * @param numberOfMessages - Number of messages.
 * @returns number - Normalized message count score (between 0 and 1; the higher, the better).
 */
function normalizeMessageCount(numberOfMessages: number): number {
  return minMaxNormalize(numberOfMessages, 10, 0);
}

/**
 * Normalizes the sentiment analysis metric
 * @param score - non-normalized sentiment polarity
 * @returns normalized sentiment polarity (between 0 and 1; the higher, the more positive)
 */
function normalizeSentimentAnalysis(score: number) {
  return sigmoidNormalize(score);
}

export { metricNormalizationFunctions };
