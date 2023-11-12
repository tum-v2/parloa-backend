enum ConversationStatus {
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
}

enum SimulationStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
}

enum ConversationType {
  MANUAL = 'MANUAL',
  AUTOMATED = 'AUTOMATED',
}

enum ConversationDomain {
  FLIGHT = 'FLIGHT',
  INSURANCE = 'INSURANCE',
}

enum LLMModel {
  GPT4 = 'GPT4',
  LLAMA2 = 'LLAMA2',
}

export { ConversationStatus, SimulationStatus, ConversationType, ConversationDomain, LLMModel };
