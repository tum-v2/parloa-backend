import { MetricDocument } from '@db/models/metric.model';
import { EvaluationStatus } from '@enums/evaluation-status.enum';

/**
 * Response for the /results-for-conversation endpoint
 */
type EvaluationResultForConversation = EvaluationExecuted | EvaluationInProgress | EvaluationNotExecuted;

/**
 * Response for a conversation whose evaluation is currently in progress
 */
interface EvaluationInProgress {
  status: EvaluationStatus.IN_PROGRESS;
}

/**
 * Response for a conversation which hasn't been evaluated yet
 */
interface EvaluationNotExecuted {
  status: EvaluationStatus.NOT_EVALUATED;
}

/**
 * Response for a conversation which has been evaluated
 */
interface EvaluationExecuted {
  status: EvaluationStatus.EVALUATED;

  /** overall score */
  score: number;

  /** name, value (normalized score), rawValue (unnormalized score) and weight of each metric */
  metrics: Pick<MetricDocument, 'name' | 'value' | 'rawValue' | 'weight'>[];
}

export default EvaluationResultForConversation;
export { EvaluationExecuted };
