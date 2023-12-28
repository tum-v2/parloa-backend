import { CustomAgentConfig } from '@simulation/agents/custom.agent.config';
import {
  HUMAN_INPUT_USER_AGENT,
  SYSTEM_PROMPT_USER_AGENT,
  TEMPERATURE_USER_AGENT,
  TOOL_OUTPUT_USER_AGENT,
} from '@simulation/config/prompt';

/**
 * Retrieves the user agent configuration based on user input.
 * @param role - The request by the user from the service agent.
 * @param persona - The persona during the conversation.
 * @param conversationStrategy - The conversation strategy for the communication with the service agent.
 * @returns The custom agent configuration for the specified input.
 */
export function getUserConfig(role: string, persona: string, conversationStrategy: string): CustomAgentConfig {
  const personaConfig = new CustomAgentConfig();
  personaConfig.temperature = TEMPERATURE_USER_AGENT;
  personaConfig.role = role;
  personaConfig.persona = persona;
  personaConfig.conversationStrategy = conversationStrategy;
  personaConfig.systemPromptTemplate = SYSTEM_PROMPT_USER_AGENT;
  personaConfig.humanInputTemplate = HUMAN_INPUT_USER_AGENT;
  personaConfig.toolOutputTemplate = TOOL_OUTPUT_USER_AGENT;

  return personaConfig;
}
