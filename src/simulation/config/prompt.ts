const SYSTEM_PROMPT_SERVICE_AGENT = `# YOUR ROLE
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

const HUMAN_INPUT_SERVICE_AGENT = `
USER: {humanInput}
# YOUR RESPONSE
`;

const TOOL_OUTPUT_SERVICE_AGENT = `
# RESULT FROM '{toolName}' TOOL
{toolOutput}

# YOUR RESPONSE
`;

const TEMPERATURE_USER_AGENT = 1;

const SYSTEM_PROMPT_USER_AGENT = `# YOUR ROLE
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

const HUMAN_INPUT_USER_AGENT = `AGENT: {humanInput}
# YOUR RESPONSE
`;
const TOOL_OUTPUT_USER_AGENT = `# RESULT FROM '{toolName}' TOOL
{toolOutput}

# YOUR RESPONSE
`;

export {
  SYSTEM_PROMPT_SERVICE_AGENT,
  HUMAN_INPUT_SERVICE_AGENT,
  TOOL_OUTPUT_SERVICE_AGENT,
  TEMPERATURE_USER_AGENT,
  SYSTEM_PROMPT_USER_AGENT,
  HUMAN_INPUT_USER_AGENT,
  TOOL_OUTPUT_USER_AGENT,
};
