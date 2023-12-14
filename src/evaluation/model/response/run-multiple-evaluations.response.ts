import { EvaluationExecutedWithConversation } from './results-for-simulation.response';

/** evaluation result for each evaluated conversation (including the id of each conversation) */
type RunMultipleEvaluationsResponse = EvaluationExecutedWithConversation[];

export default RunMultipleEvaluationsResponse;
