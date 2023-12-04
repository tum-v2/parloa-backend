import { MetricDocument } from 'evaluation/db/models/metric.model';

type EvaluationResultForConversation = EvaluationExecuted | EvaluationInProgress | EvaluationNotExecuted;

type EvaluationResultForSimulation = SimulationEvaluationExecuted | SimulationEvaluationNotExecuted;

enum EvaluationStatus {
  EVALUATED = 'evaluated',
  IN_PROGRESS = 'in_progress',
  NOT_EVALUATED = 'not_evaluated',
}

interface SimulationEvaluationNotExecuted {
  status: EvaluationStatus.NOT_EVALUATED;
}

interface SimulationEvaluationExecuted {
  status: EvaluationStatus.EVALUATED;
  averageScore: Omit<EvaluationExecuted, 'status'>;
  conversations: EvaluationExecutedWithConversation[];
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
  metrics: Pick<MetricDocument, 'name' | 'value' | 'rawValue' | 'weight'>[];
}

interface EvaluationExecutedWithConversation extends Omit<EvaluationExecuted, 'status'> {
  conversation: string;
}

export { EvaluationStatus, EvaluationResultForConversation, EvaluationResultForSimulation, EvaluationExecuted };
