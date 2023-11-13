enum SimulationScenario {
  SEQUENCE = 'SEQUENCE',
  SLOT_FILLING = 'SLOT_FILLING',
  CALL_FORWARD = 'CALL_FORWARD',
}

enum SimulationStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
}

enum ConversationStatus {
  ONGOING = 'ONGOING',
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

export { SimulationScenario, SimulationStatus, ConversationStatus, ConversationType, ConversationDomain, LLMModel };
