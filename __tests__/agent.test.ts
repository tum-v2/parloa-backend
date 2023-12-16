import request, { Response } from 'supertest';

const validInput = {
  name: 'TEST AGENT',
  llm: 'FAKE',
  temperature: 0,
  maxTokens: 256,
  domain: 'FLIGHT',
  prompt: 'sarcastic',
};

let agentId = '';

describe('POST /api/v1/agent/', () => {
  let validResponse: Response;

  beforeEach(async () => {
    validResponse = await request('http://localhost:3000').post('/api/v1/agent/').send(validInput);
    agentId = validResponse.body._id;
  });

  afterEach(() => {
    validResponse = {} as Response;
  });

  it('should return 201 for valid input', () => {
    expect(validResponse.status).toBe(201);
  });
});

describe('GET /api/v1/agent/:id', () => {
  let validResponse: Response;

  beforeEach(async () => {
    validResponse = await request('http://localhost:3000').get(`/api/v1/agent/${agentId}`);
  });

  afterEach(() => {
    validResponse = {} as Response;
  });

  it('should return 200 for valid agent ID', () => {
    expect(validResponse.status).toBe(200);
  });
});

describe('GET /api/v1/agent/all', () => {
  let validResponse: Response;

  beforeEach(async () => {
    validResponse = await request('http://localhost:3000').get(`/api/v1/agent/all`);
  });

  afterEach(() => {
    validResponse = {} as Response;
  });

  it('should return 200 for valid agent ID and return at least 1 agent', () => {
    expect(validResponse.status).toBe(200);
    expect(validResponse.body.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/v1/agent/:id', () => {
  let validResponse: Response;

  beforeEach(async () => {
    validResponse = await request('http://localhost:3000').put(`/api/v1/agent/${agentId}`).send({ prompt: 'nonative' });
  });

  afterEach(() => {
    validResponse = {} as Response;
  });

  it('should return 200 for valid agent ID and return agent with updated prompt', () => {
    expect(validResponse.status).toBe(200);
    expect(validResponse.body.prompt).toBe('nonative');
  });
});

describe('DELETE /api/v1/agent/:id', () => {
  let validResponse: Response;
  let getResponse: Response;

  beforeEach(async () => {
    validResponse = await request('http://localhost:3000').delete(`/api/v1/agent/${agentId}`);
    getResponse = await request('http://localhost:3000').get(`/api/v1/agent/${agentId}`);
  });

  afterEach(() => {
    validResponse = {} as Response;
  });

  it('should return 204 for valid agent ID and agent should be deleted', () => {
    expect(validResponse.status).toBe(204);
    expect(getResponse.status).toBe(404);
  });
});
