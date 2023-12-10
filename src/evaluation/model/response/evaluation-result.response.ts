import { MetricDocument } from '@db/models/metric.model';
import { EvaluationStatus } from '@enums/evaluation-status.enum';

type EvaluationResultForConversation = EvaluationExecuted | EvaluationInProgress | EvaluationNotExecuted;
type EvaluationResultForSimulation = SimulationEvaluationExecuted | SimulationEvaluationNotExecuted;

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

export { EvaluationResultForConversation, EvaluationResultForSimulation, EvaluationExecuted };
