import request, { Response } from 'supertest';
import dotenv from 'dotenv';

dotenv.config();
const HOSTNAME = `http://localhost:${process.env.NODE_DOCKER_PORT}`;

const validInput = {
  name: 'TEST AGENT',
  llm: 'FAKE',
  temperature: 0,
  maxTokens: 256,
  domain: 'FLIGHT',
  prompt: 'sarcastic',
};

const invalidInput = {
  name: 'TEST AGENT',
  llm: 'GPT3',
  temperature: 0,
  maxTokens: 256,
  domain: 'FLIGHT',
  prompt: 'sarcastic',
};

let agentId = '';

describe('POST /api/v1/agents/', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).post('/api/v1/agents/').send(validInput);
    agentId = validResponse.body._id;
    invalidResponse = await request(HOSTNAME).post('/api/v1/agents/').send(invalidInput);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 201 for valid input', () => {
    expect(validResponse.status).toBe(201);
  });

  it('should return 400 for invalid llm model', () => {
    expect(invalidResponse.status).toBe(400);
  });
});

describe('GET /api/v1/agents/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).get(`/api/v1/agents/${agentId}`);
    invalidResponse = await request(HOSTNAME).get(`/api/v1/agents/123`);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 200 for valid agent ID', () => {
    expect(validResponse.status).toBe(200);
  });

  it('should return 400 for invalid agent ID', () => {
    expect(invalidResponse.status).toBe(400);
  });
});

describe('GET /api/v1/agents', () => {
  let validResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).get(`/api/v1/agents`);
  });

  afterEach(() => {
    validResponse = {} as Response;
  });

  it('should return 200 for valid agent ID and return at least 1 agent', () => {
    expect(validResponse.status).toBe(200);
    expect(validResponse.body.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/v1/agents/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).put(`/api/v1/agents/${agentId}`).send({ prompt: 'nonative' });
    invalidResponse = await request(HOSTNAME).put(`/api/v1/agents/${agentId}`).send({ llm: 'GPT3' });
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 200 for valid agent ID and return agent with updated prompt', () => {
    expect(validResponse.status).toBe(200);
    expect(validResponse.body.prompt).toBe('nonative');
  });

  it('should return 400 for invalid llm model', () => {
    expect(invalidResponse.status).toBe(400);
  });
});

describe('DELETE /api/v1/agents/:id', () => {
  let validResponse: Response;
  let getResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).delete(`/api/v1/agents/${agentId}`);
    getResponse = await request(HOSTNAME).get(`/api/v1/agents/${agentId}`);
    invalidResponse = await request(HOSTNAME).delete(`/api/v1/agents/${agentId}`);
  });

  afterEach(() => {
    validResponse = {} as Response;
    getResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 204 for valid agent ID and agent should be deleted', () => {
    expect(validResponse.status).toBe(204);
    expect(getResponse.status).toBe(404);
  });

  it('should return 404 when the agent does not exist', () => {
    expect(invalidResponse.status).toBe(404);
  });
});
