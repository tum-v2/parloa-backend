import { MetricNameEnum } from '@enums/metric-name.enum';

const metricNormalizationFunctions: Map<MetricNameEnum, (score: number) => number> = new Map([
  [MetricNameEnum.SUCCESS, (score) => score],
  [MetricNameEnum.RESPONSE_TIME, normalizeResponseTime],
  [MetricNameEnum.MESSAGE_COUNT, normalizeMessageCount],
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
 * Normalizes the response time.
 * @param responseTime - response time.
 * @returns number - Normalized response time (score between 0 and 1; the higher, the better).
 */
function normalizeResponseTime(responseTime: number): number {
  const maxThreshold = 180_000; // 3 minutes
  const minThreshold = 0;

  if (responseTime > maxThreshold) {
    return 0;
  }

  return minMaxNormalize(responseTime, maxThreshold, minThreshold);
}

/**
 * Normalizes the message count metric.
 * @param numberOfMessages - Number of messages.
 * @returns number - Normalized message count score (between 0 and 1; the higher, the better).
 */
function normalizeMessageCount(numberOfMessages: number): number {
  return minMaxNormalize(numberOfMessages, 10, 0);
}

export { metricNormalizationFunctions };
