// Agent config model class that frontend will input
import LLMModel from '../enum/llm-model';

interface AgentConfig {
  model: LLMModel;
  temperature: number;
  maxTokens: number;
  prompt: string;
}

export default AgentConfig;
