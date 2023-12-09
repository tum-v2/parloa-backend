import { MetricNameEnum } from '@enums/metric-name.enum';

const metricWeightMap: Map<MetricNameEnum, number> = new Map([
  [MetricNameEnum.SUCCESS, 1 / 3],
  [MetricNameEnum.RESPONSE_TIME, 1 / 3],
  [MetricNameEnum.MESSAGE_COUNT, 1 / 3],
]);

export { metricWeightMap };
