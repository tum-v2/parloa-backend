import AgentConfig from './agent-config.model';

interface SimulationConfig {
  simulationName: string;
  numConversations: number;
  serviceAgentConfig: AgentConfig;
  userAgentConfig: AgentConfig;
}

export default SimulationConfig;
