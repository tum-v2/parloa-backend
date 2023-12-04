interface RunEvaluationRequest {
  conversation: string;
  simulation: string;
  isLast: boolean;
  optimization: string | null;
}

export { RunEvaluationRequest };
