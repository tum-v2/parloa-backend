import { MetricDocument } from 'evaluation/db/models/metric.model';

type EvaluationResultResponse = EvaluationExecuted | EvaluationInProgress | EvaluationNotExecuted;

enum EvaluationStatus {
  EVALUATED = 'evaluated',
  IN_PROGRESS = 'in_progress',
  NOT_EVALUATED = 'not_evaluated',
}

interface EvaluationInProgress {
  status: EvaluationStatus.IN_PROGRESS;
}

interface EvaluationNotExecuted {
  status: EvaluationStatus.NOT_EVALUATED;
}

interface EvaluationExecuted {
  status: EvaluationStatus.EVALUATED;
  score: number;
  metrics: Pick<MetricDocument, 'name' | 'value' | 'weight'>[];
}

export { EvaluationStatus, EvaluationResultResponse };
