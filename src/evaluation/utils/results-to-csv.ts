import { EvaluationExecutedWithConversation } from '@evaluation/model/response/results-for-simulation.response';
import path from 'path';
import fs from 'fs';
import { MetricNameEnum } from '@enums/metric-name.enum';

const EVALUATION_RESULTS_DIR = './evaluation_results';
const CELL_SEPARATOR = ',';

/**
 * Creates a CSV file containing the specified evaluation results
 * @param results - The results which should be stored in the csv file
 * @returns an array with the path to the created file as first and the filename as second element
 */
function evaluationResultsToCsv(results: (EvaluationExecutedWithConversation | null)[]): [string, string] {
  const filePath = path.join(EVALUATION_RESULTS_DIR, `evaluation-results_${getFormattedDate()}.csv`);

  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath));
  }

  const lines: string[] = [];

  const data: string[] = [];
  data.push('Conversation ID');
  Object.values(MetricNameEnum).forEach((metric) => data.push(metric));
  data.push('Overall score');
  lines.push(data.join(CELL_SEPARATOR));

  for (const result of results) {
    if (result) {
      lines.push(generateTableRow(result));
    } else {
      lines.push('-');
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'));
  return [filePath, path.basename(filePath)];
}

/**
 * Generates one row (representing the results of one evaluation) of the csv file
 * @param result - evaluation result
 * @returns the generated row as string
 */
function generateTableRow(result: EvaluationExecutedWithConversation): string {
  const data: string[] = [];
  data.push(result.conversation);

  Object.values(MetricNameEnum).forEach((metricName) => {
    const metric = result.metrics.find((m) => m.name === metricName);
    if (!metric) {
      throw new Error(`Unknown metric ${metricName}`);
    }
    data.push(metric.value.toFixed(3));
  });

  data.push(result.score.toFixed(3));
  return data.join(CELL_SEPARATOR);
}

/**
 * Get current time as timestamp of the form "YYYY-MM-dd_hhmmss"
 * @returns the current time as timestamp
 */
function getFormattedDate() {
  return new Date().toISOString().replace(/T/, '_').replace(/:/g, '').substring(0, 17);
}

export default evaluationResultsToCsv;
