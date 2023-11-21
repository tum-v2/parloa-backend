import request, { Response } from 'supertest';
import app from '../src/index';

let validSimulationId = '';
let deleteValidSimulationId = '';
const invalidSimulationId = '000000000000000000000000';

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
  user: '000000000000000000000000',
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

describe('PATCH /api/v1/simulation/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validInput.name = 'api-test';
    validResponse = await request(app).patch(`/api/v1/simulation/${validSimulationId}`).send(validInput);
    invalidResponse = await request(app).patch(`/api/v1/simulation/${invalidSimulationId}`).send(invalidInput);
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

  it('should return 400 for invalid simulation ID', () => {
    expect(invalidResponse.status).toBe(400);
  });
});
