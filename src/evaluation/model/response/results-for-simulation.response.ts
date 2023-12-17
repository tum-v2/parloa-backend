import { EvaluationStatus } from '@enums/evaluation-status.enum';
import { EvaluationExecuted } from '@evaluation/model/response/results-for-conversation.response';

/**
 * Response for the /results-for-simulation endpoint
 */
type EvaluationResultForSimulation = SimulationEvaluationExecuted | SimulationEvaluationNotExecuted;

/**
 * Response for a simulation which hasn'tbeen evaluated yet
 */
interface SimulationEvaluationNotExecuted {
  status: EvaluationStatus.NOT_EVALUATED;
}

/**
 * Response for a simulation which has been evaluated
 */
interface SimulationEvaluationExecuted {
  status: EvaluationStatus.EVALUATED;

  /** average score per metric over all conversations */
  averageScore: Omit<EvaluationExecuted, 'status'>;

  /** evaluations results per conversation */
  conversations: EvaluationExecutedWithConversation[];
}

/**
 * results of evaluated conversation including conversation ID
 */
interface EvaluationExecutedWithConversation extends Omit<EvaluationExecuted, 'status'> {
  /** ObjectId of the evaluated conversation */
  conversation: string;
}

export default EvaluationResultForSimulation;
export { EvaluationExecutedWithConversation };
