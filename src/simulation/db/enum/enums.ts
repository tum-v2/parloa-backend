enum SimulationType {
  MANUAL = 'MANUAL',
  AUTOMATED = 'AUTOMATED',
  OPTIMIZATION = 'OPTIMIZATION',
  AB_TESTING = 'A/B TESTING',
}

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

enum ConversationDomain {
  FLIGHT = 'FLIGHT',
  INSURANCE = 'INSURANCE',
}

enum LLMModel {
  GPT35 = 'GPT35',
  GPT35TURBO = 'GPT35TURBO',
  GPT4 = 'GPT4',
  LLAMA2 = 'LLAMA2',
  FAKE = 'FAKE',
}

enum MsgTypes {
  HUMANINPUT = 'HUMANINPUT',
  SYSTEMPROMPT = 'SYSTEMPROMPT',
  TOOLCALL = 'TOOLCALL',
  TOOLOUTPUT = 'TOOLOUTPUT',
  MSGTOUSER = 'MSGTOUSER',
  ROUTE = 'ROUTE',
}

enum MsgSender {
  USER = 'USER',
  AGENT = 'AGENT',
  TOOL = 'TOOL',
}

export {
  SimulationScenario,
  SimulationStatus,
  ConversationStatus,
  SimulationType,
  ConversationDomain,
  LLMModel,
  MsgTypes,
  MsgSender,
};
