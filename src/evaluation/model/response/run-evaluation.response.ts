/**
 * Response that is being sent to Simulation after an evaluation is done for a conversation.
 */
interface RunEvaluationResponse {
  /** Optimization ID, only if conversation is part of an optimized simulation. */
  optimization: string | null;

  /** ID of the simulation that the conversation is a part of. */
  simulation: string;

  /** ID of the evaluation document that is created for the evaluated conversation. */
  evaluation: string;
}

export { RunEvaluationResponse };
