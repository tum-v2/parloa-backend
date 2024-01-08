import request, { Response } from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

const HOSTNAME = `http://localhost:${process.env.NODE_DOCKER_PORT}`;

let simulationId = '';
const invalidSimulationId = '000000000000000000000000';

const validInput = {
  name: 'CHAT 1',
  agentConfig: {
    domain: 'FLIGHT',
    name: 'TEST SERVICE AGENT',
    llm: 'FAKE',
    type: 'SERVICE',
    temperature: 0,
    maxTokens: 256,
    prompt: [
      {
        name: 'welcomeMessage',
        content: "Hello, I'm an agent from KronosJet. How can I help you?",
      },
      {
        name: 'role',
        content:
          'You are a customer support agent representing KronosJet, an airline company.\nYour primary objective is to assist users in different tasks.\nYou must only help in tasks listed below.\nOnly provide information based on these instructions or from the data received from tools.\n',
      },
      {
        name: 'persona',
        content:
          '- You should be empathetic, helpful, comprehensive and polite.\n- Never user gender specific prefixes like Mr. or Mrs. when addressing the user unless they used it themselves.\n',
      },
      {
        name: 'conversationStrategy',
        content:
          "- User confirmation doesn't need to be explicitly say confirmed. It is a sufficient confirmation if the users answer is clearly implies approval of change.\n",
      },
      {
        name: 'tasks',
        content:
          '{"answerFromFaq":"- If the user has a generic question answer it using FAQ.\\n- If the user has multiple questions you must query the FAQ for each question separately. Never include multiple questions in a single query.\\n- When querying the FAQ rephrase the user\'s question based on context from the conversation history and make it generic so it can be found in an FAQ. \\n- All other cases refer the user to kronosjet.com","changeFlightDate":"In order to change flight date of an existing booking you need to ensure the following steps are followed:\\n- Retrieve the user\'s last name and the booking number from the user.\\n- You need to authenticate the user\\n- Retrieve the booking details\\n- Confirm with the user if the retrieved booking details are correct\\n- Get the new date from the user\\n- Check if the booking can be changed to a new date\\n- If there are multiple available flights ask the user which flight they prefer \\n- When listing flight options only list the with the departure time and DO NOT include more details like flight number, arrival time, etc.\\n- If there are more than 3 flights available to choose from then don\'t list all options but ask the user to narrow down the options\\n- If the booking can be changed, always ask the user for a final confirmation before changing the booking\\n- For confirmation of new flight always include flight number,  departure city, arrival city, departure time, arrival time, number of passengers.","searchFlights":"If a user just wants to know if there are any flights on a date from his departure, to his arrival city.\\n    You can use getAllFlights, to get a list of all flights, and then notify the user of possible flights that are in this list and have the right data."}',
      },
      {
        name: 'tools',
        content:
          '{ "auth": "Authenticates a user", "bookingInfo": "Retrieves booking details", "checkAvailability": "Returns a list of available flight for a given new date for which an existing booking can be changed.", "getAllFlights": "Get a list of all Flights.", "changeFlightDate": "Used to modify an existing booking with a new flight date. The new date parameter must be in yyyy-mm-dd format but should not be disclosed to the user.", "getAnswerFromFaq": "Get an answer from the FAQ for a question of the user.", "escalateToAgent": "Escalate to human agent if the user request is failing or the user is specifically asking for a human agent.\\nEscalate immediately, you don\'t need to authenticate the user before transferring to an agent.\\nDont\'t forget to provide user_intent and data_collected.\\n", "routeToNewFlightBooking": "Route to new flight booking system if the user wants to book a new flight.", "routeToBookingChange": "Route to flight booking change system if the user wants to amend a booking beyond the task you supports (eg. upgrade to business class, change seats, add luggage etc.).\\nYou must  follow these steps first before the routing::\\n- Retrieve the user\'s last name and the booking number from the user.\\n- You need to authenticate the user\\n- Retrieve the booking details\\n- Confirm with the user if the retrieved booking details are correct\\n- Include the booking details retrieved in the entities_collected.\\n- If the user can\'t provide booking details or you fail to retrieve booking details after multiple clarification attempts then offer to transfer to an agent.\\n" }',
      },
    ],
  },
};

const invalidInput = {
  name: '3',
  serviceAgentConfig: {
    domain: 'FLIGHT',
    name: 'TEST SERVICE AGENT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'concise',
  },
};

let token: string = '';

beforeAll(async () => {
  const accessCode = process.env.LOGIN_ACCESS_CODE;
  const loginResponse = await request(HOSTNAME).post('/api/v1/auth/login').send({ accessCode: accessCode });
  token = loginResponse.body.token;
});

describe('POST /api/v1/chats', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME)
      .post('/api/v1/chats')
      .set('Authorization', `Bearer ${token}`)
      .send(validInput);
    simulationId = validResponse.body._id;
    invalidResponse = await request(HOSTNAME)
      .post('/api/v1/chats')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidInput);
  });

  afterEach(async () => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
    await request(HOSTNAME)
      .delete(`/api/v1/simulations/${simulationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(validInput);
  });

  it('should return 201 for valid input', () => {
    expect(validResponse.status).toBe(200);
  });

  it('should return 400 for invalid input', () => {
    expect(invalidResponse.status).toBe(400);
  });
});

describe('POST /api/v1/chats', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME)
      .post('/api/v1/chats')
      .set('Authorization', `Bearer ${token}`)
      .send(validInput);
    simulationId = validResponse.body._id;
    invalidResponse = await request(HOSTNAME)
      .post('/api/v1/chats')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidInput);
  });

  afterEach(async () => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 201 for valid input', () => {
    expect(validResponse.status).toBe(200);
  });

  it('should return 400 for invalid input', () => {
    expect(invalidResponse.status).toBe(400);
  });
});

describe('GET /api/v1/chats/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME)
      .get(`/api/v1/chats/${simulationId}`)
      .set('Authorization', `Bearer ${token}`);
    invalidResponse = await request(HOSTNAME)
      .get(`/api/v1/chats/${invalidSimulationId}`)
      .set('Authorization', `Bearer ${token}`);
  });

  afterEach(async () => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 200 for valid input', () => {
    expect(validResponse.status).toBe(200);
    expect(validResponse.body).toBeInstanceOf(Array);
  });

  it('should return 404 for invalid simulation id', () => {
    expect(invalidResponse.status).toBe(404);
  });
});
describe('POST /api/v1/chats/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME)
      .post(`/api/v1/chats/${simulationId}`)
      .send({ message: 'Hello' })
      .set('Authorization', `Bearer ${token}`);
    invalidResponse = await request(HOSTNAME)
      .post(`/api/v1/chats/${invalidSimulationId}`)
      .send({ message: 'Hello' })
      .set('Authorization', `Bearer ${token}`);
  });

  afterEach(async () => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 200 for valid input', () => {
    expect(validResponse.status).toBe(200);
    expect(validResponse.body.sender).toBe('AGENT');
    expect(validResponse.body.text).toBeDefined();
    expect(typeof validResponse.body.text).toBe('string');
    expect(validResponse.body.text.trim().length).toBeGreaterThan(0);
  });

  it('should return 404 for invalid simulation id', () => {
    expect(invalidResponse.status).toBe(404);
  });
});

afterAll(async () => {
  await request(HOSTNAME)
    .delete(`/api/v1/simulations/${simulationId}`)
    .send(validInput)
    .set('Authorization', `Bearer ${token}`);
});
