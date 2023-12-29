import {
  APIParam,
  APIRequest,
  APIResponse,
  RestAPITool,
  RouteToCoreTool,
} from '@simulation/agents/custom.agent.config';
import {
  auth,
  bookingInfo,
  checkAvailability,
  changeFlightDate,
  getAllFlights,
} from '@simulation/mockedAPI/flightBooking.mocks';
import { getFaqAnswer } from '@simulation/mockedAPI/parloa.kf.faq';

const bookingNumberParam = new APIParam(
  'booking_number',
  'The booking number. Format is 6 alphanumeric characters.',
  'string',
);

const authTokenParam = new APIParam('auth_token', 'auth_token returned by the auth tool', 'string');

const flightRestApiTools: Record<string, RestAPITool> = {
  auth: new RestAPITool(
    'Authenticates a user',
    new APIRequest([
      bookingNumberParam,
      new APIParam('last_name', 'Last Name of the person who made the booking.', 'string'),
    ]),
    new APIResponse('auth_token to be used for other tools'),
    (data) => {
      if (data.booking_number === undefined) {
        return JSON.stringify({ error: 'You forgot to input a booking_number!' });
      }
      if (data.last_name === undefined) {
        return JSON.stringify({ error: 'You forgot to input a last_name!' });
      }
      if (data.booking_number === '') {
        return JSON.stringify({ error: 'Your provided booking is empty.' });
      }
      if (data.last_name === '') {
        return JSON.stringify({ error: 'Your provided last_name number is empty.' });
      }
      return JSON.stringify(auth(data.booking_number, data.last_name));
    },
  ),
  bookingInfo: new RestAPITool(
    'Retrieves booking details',
    new APIRequest([authTokenParam, bookingNumberParam]),
    new APIResponse(
      '"flight number, departure and arrival airports, departure and arrival times, and the date of the flight"',
    ),
    (data) => {
      if (data.booking_number === undefined) {
        return JSON.stringify({ error: 'You forgot to input a booking_number!' });
      }
      if (data.auth_token === undefined) {
        return JSON.stringify({ error: 'You forgot to input a auth_token!' });
      }
      return JSON.stringify(bookingInfo(data.booking_number, data.auth_token));
    },
  ),
  checkAvailability: new RestAPITool(
    'Returns a list of available flight for a given new date for which an existing booking can be changed.',
    new APIRequest([
      authTokenParam,
      bookingNumberParam,
      new APIParam(
        'new_date',
        'New Date of flight to check availability. You can either input one date as string, or an string[] The new date must be provided in yyyy-mm-dd format but the format should not be mentioned to the user.',
        'string or string[]',
      ),
    ]),
    new APIResponse('List of available flights'),
    (data) => {
      let arrayResult: any[] = [];
      if (data.booking_number === undefined) {
        return JSON.stringify({ error: 'You forgot to input a booking_number!' });
      }
      if (data.auth_token === undefined) {
        return JSON.stringify({ error: 'You forgot to input a auth_token!' });
      }
      if (data.new_date === undefined) {
        return JSON.stringify({ error: 'You forgot to input a new_date!' });
      }

      if (data.new_date !== undefined) {
        if (typeof data.new_date === 'string') {
          arrayResult = checkAvailability(data.booking_number, data.new_date, data.auth_token) as any[];
        } else {
          const array: string[] = data.new_date as string[];
          for (const element of array) {
            const res: any[] = checkAvailability(data.booking_number, element, data.auth_token) as any[];
            if (Array.isArray(res)) {
              arrayResult = arrayResult.concat(res);
            }
          }
        }
      }
      return JSON.stringify(arrayResult);
    },
  ),
  getAllFlights: new RestAPITool(
    'Get a list of all Flights.',
    new APIRequest([]),
    new APIResponse(
      '"flight number, departure and arrival airports, departure and arrival times, and the date of the flight"',
    ),
    () => JSON.stringify(getAllFlights()),
  ),
  changeFlightDate: new RestAPITool(
    'Used to modify an existing booking with a new flight date. The new date parameter must be in yyyy-mm-dd format but should not be disclosed to the user.',
    new APIRequest([
      authTokenParam,
      bookingNumberParam,
      new APIParam(
        'new_date',
        'New Date to change the flight booking to. The new date must be provided in yyyy-mm-dd format but the format should not be mentioned to the user.',
        'string',
      ),
    ]),
    new APIResponse('Success or Failure'),
    (data) => {
      if (data.booking_number === undefined) {
        return JSON.stringify({ error: 'You forgot to input a booking_number!' });
      }
      if (data.auth_token === undefined) {
        return JSON.stringify({ error: 'You forgot to input a auth_token!' });
      }
      if (data.new_date === undefined) {
        return JSON.stringify({ error: 'You forgot to input a new_date!' });
      }
      return JSON.stringify(changeFlightDate(data.booking_number, data.new_date, data.auth_token));
    },
  ),
  getAnswerFromFaq: new RestAPITool(
    'Get an answer from the FAQ for a question of the user.',
    new APIRequest([new APIParam('question', 'The question to ask from the FAQ', 'string')]),
    new APIResponse('Answer to the question or ANSWER_NOT_FOUND'),
    async (data) => {
      if (data.question === undefined) {
        return `You forgot to provide a question in the action_input like this e.g.  { "question":"Your question here?"}`;
      }
      return await getFaqAnswer(data.question);
    },
  ),
};

const defaultRoutingParams: APIParam[] = [
  new APIParam('user_intent', "short summary of the user's intent", 'string'),
  new APIParam('data_collected', 'list of all the inputs already received from user', 'json'),
];

const flightRoutingTools: Record<string, RouteToCoreTool> = {
  escalateToAgent: new RouteToCoreTool(
    `Escalate to human agent if the user request is failing or the user is specifically asking for a human agent.
  Escalate immediately, you don't need to authenticate the user before transferring to an agent.
  Dont't forget to provide user_intent and data_collected as 
`,
    new APIRequest(defaultRoutingParams),
    'EscalateToAgent',
  ),
  routeToNewFlightBooking: new RouteToCoreTool(
    'Route to new flight booking system if the user wants to book a new flight.',
    new APIRequest(defaultRoutingParams),
    'RouteToNewFlightBooking',
  ),
  routeToBookingChange: new RouteToCoreTool(
    `Route to flight booking change system if the user wants to amend a booking beyond the task you supports (eg. upgrade to business class, change seats, add luggage etc.).
  You must  follow these steps first before the routing::
  - Retrieve the user's last name and the booking number from the user.
  - You need to authenticate the user
  - Retrieve the booking details
  - Confirm with the user if the retrieved booking details are correct
  - Include the booking details retrieved in the entities_collected.
  - If the user can't provide booking details or you fail to retrieve booking details after multiple clarification attempts then offer to transfer to an agent.
  `,
    new APIRequest([
      ...defaultRoutingParams,
      new APIParam('is_authenticated', 'True if authentication was successful', 'boolean'),
      new APIParam('last_name', 'Last Name of the person who made the booking.', 'string'),
    ]),
    'RouteToBookingChange',
  ),
};

const fakeServiceAgentResponses: string[] = [
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
const fakeUserAgentResponses: string[] = [
  `{"thought":"I should clearly state my problem to the agent. My flight needs to be rescheduled to a later date.","action":"message_to_user","action_input":"Hello agent, am me Claudio Diniz. I change my flight. Booking number is PALO0A is it correct, yea?"}`,
  `{"thought":"Looks like there's a bit of confusion. I should repeat my information but a bit more clearly this time.","action":"message_to_user","action_input":"Apologies for the confusion. Surname it is Diniz, booking number PARL0A, Not PALO0A."}`,
  `{"thought":"This is the correct booking. Now, I should ask the agent to change the booking to my desired date and time.","action":"message_to_user","action_input":"Yes yes, Correct booking. I need to change it to novermber 17 or 18 or 19. Any time is fine but 2pm interesting for me."}`,
  `{"thought":"The available options are not during the time I prefer but it is still within the range of dates I provided. I should probably take the later flight as it is closer to my preferred time.","action":"message_to_user","action_input":"hmm, ok. 5.30 pm is close to my prefer time so, I take that one."}`,
  `{"thought":"The flight details provided are correct. Let's confirm the change.","action":"message_to_user","action_input":"Yes, correct details. I confirm this change. Thank you."}`,
  `{"thought":"The agent has successfully changed my flight booking. Now, I should end the call as I have no more inquiries.","action":"message_to_user","action_input":"/hangup"}`,
];

export { flightRestApiTools, flightRoutingTools, fakeServiceAgentResponses, fakeUserAgentResponses };
