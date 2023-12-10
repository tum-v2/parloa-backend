import { MetricNameEnum } from '@enums/metric-name.enum';

const metricWeightMap: Map<MetricNameEnum, number> = new Map([
  [MetricNameEnum.SUCCESS, 1 / 6],
  [MetricNameEnum.RESPONSE_TIME, 1 / 6],
  [MetricNameEnum.MESSAGE_COUNT, 1 / 6],
  [MetricNameEnum.RECOVERY_RATE, 1 / 6],
  [MetricNameEnum.SIMILARITY, 1 / 6],
  [MetricNameEnum.SENTIMENT_ANALYSIS, 1 / 6],
]);

export { metricWeightMap };
