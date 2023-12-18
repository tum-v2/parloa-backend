import request, { Response } from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

const hostname = `http://localhost:${process.env.NODE_DOCKER_PORT}`;

let simulationId = '';
const invalidSimulationId = '000000000000000000000000';

const validInput = {
  name: 'CHAT 1',
  agentConfig: {
    domain: 'FLIGHT',
    name: 'TEST SERVICE AGENT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'concise',
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

describe('POST /api/v1/chats', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(hostname).post('/api/v1/chats').send(validInput);
    simulationId = validResponse.body._id;
    invalidResponse = await request(hostname).post('/api/v1/chats').send(invalidInput);
  });

  afterEach(async () => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
    await request(hostname).delete(`/api/v1/simulations/${simulationId}`).send(validInput);
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
    validResponse = await request(hostname).post('/api/v1/chats').send(validInput);
    simulationId = validResponse.body._id;
    invalidResponse = await request(hostname).post('/api/v1/chats').send(invalidInput);
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
    validResponse = await request(hostname).get(`/api/v1/chats/${simulationId}`);
    invalidResponse = await request(hostname).get(`/api/v1/chats/${invalidSimulationId}`);
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
    validResponse = await request(hostname).post(`/api/v1/chats/${simulationId}`).send({ message: 'Hello' });
    invalidResponse = await request(hostname).post(`/api/v1/chats/${invalidSimulationId}`).send({ message: 'Hello' });
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
  await request(hostname).delete(`/api/v1/simulations/${simulationId}`).send(validInput);
});
