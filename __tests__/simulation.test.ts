import request, { Response } from 'supertest';
import app from '../src/index';

const validSimulationId = '6554dee0da0137714817df0d';
const invalidSimulationId = '007';

const validInput = {
  user: '65515f13d5dbce1dd781ef60',
  scenario: 'SLOT_FILLING',
  type: 'AUTOMATED',
  domain: 'FLIGHT',
  name: '3',
  numConversations: 100,
  serviceAgentConfig: {
    llm: 'LLAMA2',
    temperature: 0,
    maxTokens: 256,
    prompt: 'you are a helpful bot',
  },
  userAgentConfig: {
    llm: 'GPT4',
    temperature: 0,
    maxTokens: 256,
    prompt: 'you are an angry customer',
  },
};

const invalidInput = {
  user: '007',
  scenario: 'SLOT_FILLING',
  type: 'AUTOMATED',
  domain: 'ECOMMERCE',
  name: '3',
  numConversations: 100,
  serviceAgentConfig: {
    llm: 'LLAMA2',
    temperature: 0,
    maxTokens: 256,
    prompt: 'you are a helpful bot',
  },
  userAgentConfig: {
    llm: 'GPT4',
    temperature: 0,
    maxTokens: 256,
    prompt: 'you are an angry customer',
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

  it('should return 400 for invalid simulation ID', () => {
    expect(invalidResponse.status).toBe(400);
  });
});

describe('GET /api/v1/simulation/:id/details', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(app).get(`/api/v1/simulation/${validSimulationId}/details`);
    invalidResponse = await request(app).get(`/api/v1/simulation/${invalidSimulationId}/details`);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
  });

  it('should return 200 for valid simulation ID', () => {
    expect(validResponse.status).toBe(200);
  });

  it('should return 400 for invalid simulation ID', () => {
    expect(invalidResponse.status).toBe(400);
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

  it('should return 400 for invalid simulation ID', () => {
    expect(invalidResponse.status).toBe(400);
  });
});
