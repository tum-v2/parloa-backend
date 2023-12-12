import request, { Response } from 'supertest';
import { app, server } from '../src/index';
import { disconnectFromDatabase } from '@db/config/db.config';

let validSimulationId = '';
let deleteValidSimulationId = '';
const invalidSimulationId = '000000000000000000000000';

const validInput = {
  type: 'AUTOMATED',
  name: 'GENERATED2',
  description: 'Second Simulation run by me',
  numConversations: 1,
  serviceAgentConfig: {
    domain: 'FLIGHT',
    name: 'TEST SERVICE AGENT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'concise',
  },
  userAgentConfig: {
    domain: 'FLIGHT',
    name: 'TEST USER AGENT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
};

const invalidInput = {
  type: 'AUTOMATED',
  name: '3',
  description: 'Second Simulation run by me',
  numConversations: 1,
  serviceAgentConfig: {
    domain: 'FLIGHT',
    name: 'TEST SERVICE AGENT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'concise',
  },
  userAgentConfig: {
    domain: 'FLIGHT',
    name: 'TEST USER AGENT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
};

describe('POST /api/v1/simulation/run', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(app).post('/api/v1/simulation/run').send(validInput);
    invalidResponse = await request(app).post('/api/v1/simulation/run').send(invalidInput);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 201 for valid input', () => {
    expect(validResponse.status).toBe(201);
  });

  it('should return 400 for invalid input', () => {
    expect(invalidResponse.status).toBe(400);
  });
});

describe('GET /api/v1/simulation/all', () => {
  let validResponse: Response;

  beforeEach(async () => {
    validResponse = await request(app).get(`/api/v1/simulation/all`);
    validSimulationId = validResponse.body[0]._id;
    deleteValidSimulationId = validResponse.body[1]._id;
    console.log(deleteValidSimulationId);
  });

  afterEach(() => {
    validResponse = {} as Response;
  });

  it('should return 200 for valid simulation ID', () => {
    expect(validResponse.status).toBe(200);
  });
});

describe('GET /api/v1/simulation/:id/poll', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(app).get(`/api/v1/simulation/${validSimulationId}/poll`);
    invalidResponse = await request(app).get(`/api/v1/simulation/${invalidSimulationId}/poll`);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 200 for valid simulation ID', () => {
    expect(validResponse.status).toBe(200);
  });

  it('should return 404 for invalid simulation ID', () => {
    expect(invalidResponse.status).toBe(404);
  });
});

describe('GET /api/v1/simulation/:id/conversations', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(app).get(`/api/v1/simulation/${validSimulationId}/conversations`);
    invalidResponse = await request(app).get(`/api/v1/simulation/${invalidSimulationId}/conversations`);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 200 for valid simulation ID', () => {
    expect(validResponse.status).toBe(200);
  });

  it('should return 404 for invalid simulation ID', () => {
    expect(invalidResponse.status).toBe(404);
  });
});

describe('PATCH /api/v1/simulation/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validInput.name = 'api-test';
    validResponse = await request(app).patch(`/api/v1/simulation/${validSimulationId}`).send(validInput);

    // was failing because the domain type couldn't pass the validation check
    invalidResponse = await request(app).patch(`/api/v1/simulation/${invalidSimulationId}`).send(invalidInput);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 200 for valid simulation ID', () => {
    expect(validResponse.status).toBe(200);
  });

  it('should return 404 for invalid simulation ID', () => {
    expect(invalidResponse.status).toBe(404);
  });
});

describe('DELETE /api/v1/simulation/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(app).delete(`/api/v1/simulation/${deleteValidSimulationId}`);
    invalidResponse = await request(app).delete(`/api/v1/simulation/${invalidSimulationId}`);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 204 for valid simulation ID', () => {
    expect(validResponse.status).toBe(204);
  });

  it('should return 404 for invalid simulation ID', () => {
    expect(invalidResponse.status).toBe(404);
  });
});

afterAll(() => {
  server.close(async () => {
    await disconnectFromDatabase();
  });
});
