import { CustomAgentConfig } from '@simulation/agents/custom.agent.config';

const TEMPERATURE = 1;

const SYSTEM_PROMPT_TEMPLATE = `# YOUR ROLE
{role}
Today's date is {currentDate}.

# YOUR PERSONA
{persona}

# CONVERSATION STRATEGY
{conversationStrategy}

# TOOLS
You should gather input from the agent to call tools when a tool is required.
You have access to the following tools:

{formattedTools}

{tasks}

# YOUR RESPONSE
{{
"thought": <Take a deep breath and think step by step. First include your thoughts based on the last message from the user and consider the full converstation history>
"action":  <a single action you decided to take next. The action should be either the name of a TOOL name or message_to_user  >
"action_input": <either all the inputs required for the tool which you gathered from the agent previously or the message to the agent.>
"intermediate_message": <when calling a tool you should generate a short intermediate message to the user saying to wait a bit because you are doing something>
}}

Begin! Reminder to ALWAYS respond with a single valid json blob with a single action. Use available tools if necessary.
`;

const HUMAN_INPUT_TEMPLATE = `AGENT: {humanInput}
# YOUR RESPONSE
`;
const TOOL_OUTPUT_TEMPLATE = `# RESULT FROM '{toolName}' TOOL
{toolOutput}

# YOUR RESPONSE
`;

/**
 * Retrieves the user agent configuration based on user input.
 * @param role - The request by the user from the service agent.
 * @param persona - The persona during the conversation.
 * @param conversationStrategy - The conversation strategy for the communication with the service agent.
 * @returns The custom agent configuration for the specified input.
 */
export function getUserConfig(role: string, persona: string, conversationStrategy: string): CustomAgentConfig {
  const personaConfig = new CustomAgentConfig();
  personaConfig.temperature = TEMPERATURE;
  personaConfig.role = role;
  personaConfig.persona = persona;
  personaConfig.conversationStrategy = conversationStrategy;
  personaConfig.systemPromptTemplate = SYSTEM_PROMPT_TEMPLATE;
  personaConfig.humanInputTemplate = HUMAN_INPUT_TEMPLATE;
  personaConfig.toolOutputTemplate = TOOL_OUTPUT_TEMPLATE;

  return personaConfig;
}
