import { MetricNameEnum } from '@enums/metric-name.enum';

const metricWeightMap: Map<MetricNameEnum, number> = new Map([
  [MetricNameEnum.SUCCESS, 0.2],
  [MetricNameEnum.RESPONSE_TIME, 0.2],
  [MetricNameEnum.MESSAGE_COUNT, 0.2],
  [MetricNameEnum.RECOVERY_RATE, 0.1],
  [MetricNameEnum.SIMILARITY, 0.1],
  [MetricNameEnum.SENTIMENT_ANALYSIS, 0.2],
]);

export { metricWeightMap };
