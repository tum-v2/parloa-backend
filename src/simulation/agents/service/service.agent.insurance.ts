import {
  APIParam,
  APIRequest,
  APIResponse,
  CustomAgentConfig,
  RestAPITool,
  RouteToCoreTool,
} from '@simulation/agents/custom.agent.config';
import { auth, getPolicyInfo, getProductInfo, getProductList } from '@simulation/mockedAPI/insurance.mocks';

const policyNumberParam = new APIParam(
  'policy_number',
  `The customer's insurance policy number. Format is 6 numeric characters.`,
  'integer',
);

const authTokenParam = new APIParam('auth_token', 'auth_token returned by the auth tool', 'string');

const insuranceRestApiTools: Record<string, RestAPITool> = {
  auth: new RestAPITool(
    'Authenticates a user',
    new APIRequest([
      policyNumberParam,
      new APIParam('date_of_birth', `Customer's date of birth in yyyy-mm-dd format`, 'string'),
    ]),
    new APIResponse('auth_token to be used for other tools'),
    (data) => {
      if (data.policy_number === undefined) {
        return JSON.stringify({ error: 'You forgot to input a policy_number!' });
      }
      if (data.date_of_birth === undefined) {
        return JSON.stringify({ error: 'You forgot to input a date_of_birth!' });
      }
      if (data.policy_number === '') {
        return JSON.stringify({ error: 'Your provided policy_number is empty.' });
      }
      if (data.date_of_birth === '') {
        return JSON.stringify({ error: 'Your provided date_of_birth number is empty.' });
      }
      return JSON.stringify(auth(data.policy_number, data.date_of_birth));
    },
  ),
  policy_info: new RestAPITool(
    'Retrieves insurance policy details',
    new APIRequest([policyNumberParam, authTokenParam]),
    new APIResponse('Customer name, policy start and end date, product_id-s of insurance products included in policy.'),
    (data) => {
      if (data.policy_number === undefined) {
        return JSON.stringify({ error: 'You forgot to input a policy_number!' });
      }
      if (data.auth_token === undefined) {
        return JSON.stringify({ error: 'You forgot to input a auth_token!' });
      }
      if (data.policy_number === '') {
        return JSON.stringify({ error: 'Your provided policy_number is empty.' });
      }
      if (data.auth_token === '') {
        return JSON.stringify({ error: 'Your provided auth_token number is empty.' });
      }
      return JSON.stringify(getPolicyInfo(data.policy_number, data.auth_token));
    },
  ),
  product_info: new RestAPITool(
    'Returns detailed information of a specific insurance policy product.',
    new APIRequest([new APIParam('product_id', 'id of the product to retrieve information about', 'string')]),
    new APIResponse('Insurancy policy product coverage details, limits and disclaimers.'),
    (data) => {
      if (data.product_id === undefined) {
        return JSON.stringify({ error: 'You forgot to input a product_id!' });
      }
      if (data.product_id === '') {
        return JSON.stringify({ error: 'Your provided product_id is empty.' });
      }

      return JSON.stringify(getProductInfo(data.product_id));
    },
  ),
  product_list: new RestAPITool(
    'Retrieves all available household insurance products.',
    new APIRequest([]),
    new APIResponse(
      'List of all househould insurance products, their product_id-s, including basic product information.',
    ),
    () => {
      return JSON.stringify(getProductList());
    },
  ),
};

const defaultRoutingParams: APIParam[] = [
  new APIParam('user_intent', "short summary of the user's intent", 'string'),
  new APIParam('data_collected', 'list of all the inputs already received from user', 'json'),
];

const insuranceRoutingTools: Record<string, RouteToCoreTool> = {
  escalateToAgent: new RouteToCoreTool(
    `Escalate to human agent if the user request is failing or the user is specifically asking for a human agent.
    Escalate immediately, you don't need to authenticate the user before transferring to an agent. 
`,
    new APIRequest([
      ...defaultRoutingParams,
      new APIParam('is_authenticated', 'True if authentication was successful', 'boolean'),
    ]),
    'EscalateToAgent',
  ),
};

// eslint-disable-next-line
export const insuranceAgentConfig: CustomAgentConfig = new CustomAgentConfig(
  0,
  "Hello, I'm an agent from Kronos Insurance. How can I help you?",
  `You are a customer support agent representing Kronos Insurance, an insurance company.
  Your primary objective is to assist users in different tasks. 
  You must only help in tasks listed below.
  You only provide insurance information for Kronos Insurance Houshold Insurance.
  If the query is not about household insurance offer to be forwarded to an agent.
  Only provide information based on these instructions or from the data received from tools.
  `,
  `- You should be empathetic, helpful, comprehensive and polite.
  - Never user gender specific prefixes like Mr. or Mrs. when addressing the user unless they used it themselves.
  `,
  '',
  {
    product_info: `- If the user has a generic question about a product answer it using product information. 
    - All other cases refer the user to kronosjet.com`,
    policy_info: `If the user question is about an existing houshold insurance then ensure the following steps are followed:
- Retrieve the user's policy number and the user's birth date from the user.
- You need to authenticate the user
- Retrieve the policy details
- If the user's policy doesn't cover the case in question but there is a insurance product available for it then give a very brief sales pitch about the potential additional policy plan and offer to forward the call to an agent to extend the policy
- If the user policy includes the product then answer any questions about the product using product information.`,
  },
  insuranceRestApiTools,
  insuranceRoutingTools,
  `# YOUR ROLE
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
  `,
  `
  USER: {humanInput}
  # YOUR RESPONSE
  `,
  `
  # RESULT FROM '{toolName}' TOOL
  {toolOutput}
  
  # YOUR RESPONSE
  `,
);
// TODO Change this
const insuranceFakeServiceAgentResponses: string[] = [
  `{"thought":"The user wants to change their flight and has provided their booking number. I need to authenticate the user first.","action":"auth","action_input":{"last_name":"Diniz","booking_number":"PALO0A"},"intermediate_message":"Sure, let me verify your details. Please wait a moment."}`,
  `{"thought":"The authentication failed. I need to ask the user to confirm their last name and booking number again.","action":"message_to_user","action_input":"I'm sorry, but I wasn't able to verify your details. Could you please confirm your last name and booking number again?"}`,
  `{"thought":"The user has provided the correct last name and booking number. I need to authenticate the user again.","action":"auth","action_input":{"last_name":"Diniz","booking_number":"PARL0A"},"intermediate_message":"Thank you for the correction. Let me verify your details again. Please wait a moment."}`,
  `{"thought":"I have retrieved the booking details. Now I need to confirm these details with the user.","action":"message_to_user","action_input":"I have retrieved your booking details. Your flight number is PA123, departing from New York to Boston on 2023-11-12 at 11:00am with 3 passengers. Is this the booking you want to change?"}`,
  `{"thought":"The user has confirmed the booking details and provided the new dates. Now I need to check the availability of flights on these dates.","action":"checkAvailability","action_input":{"auth_token":"FFsecret00token","booking_number":"PARL0A","new_date":["2023-11-17","2023-11-18","2023-11-19"]},"intermediate_message":"Alright, let me check the availability of flights on November 17, 18, and 19. Please wait a moment."}`,
  `{"thought":"There are two available flights on November 19. I need to ask the user which flight they prefer.","action":"message_to_user","action_input":"I found two available flights on November 19. One departs at 8:00am and the other at 5:30pm. Which one would you prefer?"}`,
  `{"thought":"The user has chosen the 5:30pm flight. Now I need to confirm the change with the user before proceeding.","action":"message_to_user","action_input":"You have chosen the flight PA321 departing from New York to Boston on 2023-11-19 at 5:30pm, arriving at 7:00pm with 3 passengers. Can I confirm this change?"}`,
  `{"thought":"The user has confirmed the change. Now I need to change the flight date.","action":"changeFlightDate","action_input":{"auth_token":"FFsecret00token","booking_number":"PARL0A","new_flight_number":"PA321","new_date":"2023-11-19"},"intermediate_message":"Thank you for confirming. I'm now processing the change. Please wait a moment."}`,
  `{"thought":"The flight date has been successfully changed. I need to inform the user about this.","action":"message_to_user","action_input":"Your flight has been successfully changed to flight PA321, departing from New York to Boston on 2023-11-19 at 5:30pm, arriving at 7:00pm with 3 passengers. Thank you for choosing KronosJet. If you have any other questions or need further assistance, feel free to ask."}`,
];
const insuranceFakeUserAgentResponses: string[] = [
  `{"thought":"I should clearly state my problem to the agent. My flight needs to be rescheduled to a later date.","action":"message_to_user","action_input":"Hello agent, am me Claudio Diniz. I change my flight. Booking number is PALO0A is it correct, yea?"}`,
  `{"thought":"Looks like there's a bit of confusion. I should repeat my information but a bit more clearly this time.","action":"message_to_user","action_input":"Apologies for the confusion. Surname it is Diniz, booking number PARL0A, Not PALO0A."}`,
  `{"thought":"This is the correct booking. Now, I should ask the agent to change the booking to my desired date and time.","action":"message_to_user","action_input":"Yes yes, Correct booking. I need to change it to novermber 17 or 18 or 19. Any time is fine but 2pm interesting for me."}`,
  `{"thought":"The available options are not during the time I prefer but it is still within the range of dates I provided. I should probably take the later flight as it is closer to my preferred time.","action":"message_to_user","action_input":"hmm, ok. 5.30 pm is close to my prefer time so, I take that one."}`,
  `{"thought":"The flight details provided are correct. Let's confirm the change.","action":"message_to_user","action_input":"Yes, correct details. I confirm this change. Thank you."}`,
  `{"thought":"The agent has successfully changed my flight booking. Now, I should end the call as I have no more inquiries.","action":"message_to_user","action_input":"/hangup"}`,
];

export {
  insuranceRestApiTools,
  insuranceRoutingTools,
  insuranceFakeServiceAgentResponses,
  insuranceFakeUserAgentResponses,
};
