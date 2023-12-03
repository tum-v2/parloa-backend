// Configuration of the metrics

enum MetricNameEnum {
  SUCCESS = 'success',
  RESPONSE_TIME = 'response_time',
  MESSAGE_COUNT = 'message_count',
}

const metricWeightMap: Map<MetricNameEnum, number> = new Map([
  [MetricNameEnum.SUCCESS, 1 / 3],
  [MetricNameEnum.RESPONSE_TIME, 1 / 3],
  [MetricNameEnum.MESSAGE_COUNT, 1 / 3],
]);

export { MetricNameEnum, metricWeightMap };