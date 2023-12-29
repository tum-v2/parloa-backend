import { CustomAgentConfig } from '@simulation/agents/custom.agent.config';
import { flightRestApiTools, flightRoutingTools } from '@simulation/agents/service/service.agent.flight.booker';
import {
  HUMAN_INPUT_SERVICE_AGENT,
  SYSTEM_PROMPT_SERVICE_AGENT,
  TOOL_OUTPUT_SERVICE_AGENT,
} from '@simulation/config/prompt';

/**
 * Creates a new flight booking agent.
 * @param role - The role of the agent.
 * @param persona - The persona to use when communicating with the user.
 * @param conversationStrategy - The conversation strategy for the communication with the user agent.
 * @param tasks - The tasks associated with the agent.
 * @returns The custom agent configuration for the specified input.
 */
export function createFlightBookingAgent(
  welcomeMessage: string,
  role: string,
  persona: string,
  conversationStrategy: string,
  tasks: string,
): CustomAgentConfig {
  return new CustomAgentConfig(
    0,
    welcomeMessage,
    role,
    persona,
    conversationStrategy,
    JSON.parse(tasks),
    flightRestApiTools,
    flightRoutingTools,
    SYSTEM_PROMPT_SERVICE_AGENT,
    HUMAN_INPUT_SERVICE_AGENT,
    TOOL_OUTPUT_SERVICE_AGENT,
  );
}

/**
 * Creates a new insurance agent.
 * @param role - The role of the agent.
 * @param persona - The persona to use when communicating with the user.
 * @param conversationStrategy - The conversation strategy for the communication with the user agent.
 * @param tasks - The tasks associated with the agent.
 * @returns The custom agent configuration for the specified input.
 */
export function createInsuranceAgent(): CustomAgentConfig {
  return new CustomAgentConfig();
}
