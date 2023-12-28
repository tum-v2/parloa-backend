import { CustomAgentConfig } from '@simulation/agents/custom.agent.config';
import { flightRestApiTools, flightRoutingTools } from '@simulation/agents/service/service.agent.flight.booker';

const SYSTEMPROMPT = `# YOUR ROLE
{role}
Today's date is {currentDate}.

# YOUR PERSONA
{persona}

# CONVERSATION STRATEGY
{conversationStrategy}

# TASKS
Make sure you the user intent is on of the tasks listed below.
Each on of the tasks has a different conversation strategy. 
You should follow the steps and instructions for the task.
{tasks}

# TOOLS
You should gather input from the user to call tools when a tool is required.
You have access to the following tools:

{formattedTools}

# YOUR RESPONSE
{{
"thought": <Take a deep breath and think step by step. First include your thoughts based on the last message from the user and consider the full conversation history. Use a very brief, bulletpoint style format>
"action":  <a single action you decided to take next. The action should be either the name of a TOOL or message_to_user  >
"action_input": <either all the inputs required for the tool and you gathered from the user previously or the message to the user.>
"intermediate_message": <when calling a tool or route you should generate a very short and concise intermediate message to the user and tell to wait. Keep this message short.>
}}

Begin! Reminder to ALWAYS respond with a single valid json blob with a single action. Use available tools if necessary.
Don't forget curly brackets around your answer and "" for your response, it needs to be valid json!!!!
`;

const HUMANINPUT = `
USER: {humanInput}
# YOUR RESPONSE
`;

const TOOLOUTPUT = `
# RESULT FROM '{toolName}' TOOL
{toolOutput}

# YOUR RESPONSE
`;

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
    SYSTEMPROMPT,
    HUMANINPUT,
    TOOLOUTPUT,
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
