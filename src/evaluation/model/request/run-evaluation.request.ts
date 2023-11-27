interface RunEvaluationRequest {
  conversationID: string;
  simulationID: string;
  isLastConversation: boolean;
  shouldOptimize: boolean;
}

export { RunEvaluationRequest };
