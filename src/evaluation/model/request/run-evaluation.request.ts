interface RunEvaluationRequest {
  /** ID of the conversation to be evaluated. */
  conversation: string;

  /** ID of the simulation that the conversation belongs to. */
  simulation: string;

  /** If the incoming conversation is the last conversation to be evaluated. */
  isLast: boolean;

  /** Optimization ID, only if the conversation to be evaluated is part of an optimized simulation. */
  optimization: string | null;
}

export { RunEvaluationRequest };
