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
  GPT35 = 'GPT35',
  GPT35TURBO = 'GPT35TURBO',
  GPT4 = 'GPT4',
  LLAMA2 = 'LLAMA2',
}

enum MsgTypes {
  HUMANINPUT = 'HUMANINPUT',
  SYSTEMPROMPT = 'SYSTEMPROMPT',
  TOOLCALL = 'TOOLCALL',
  TOOLOUTPUT = 'TOOLOUTPUT',
  MSGTOUSER = 'MSGTOUSER',
  ROUTE = 'ROUTE',
}

export {
  SimulationScenario,
  SimulationStatus,
  ConversationStatus,
  ConversationType,
  ConversationDomain,
  LLMModel,
  MsgTypes,
};
