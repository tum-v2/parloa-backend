import request, { Response } from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

const HOSTNAME = `http://localhost:${process.env.NODE_DOCKER_PORT}`;

let validSimulationId = '';
let deleteValidSimulationId = '';
const invalidSimulationId = '000000000000000000000000';

let validConversation = '';

const validInputRun = {
  type: 'AUTOMATED',
  name: 'TEST GPT4 ENDPOINT',
  description: 'Nth Simulation run by me',
  numConversations: 1,
  userAgentConfig: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
  serviceAgentConfig: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
};
const invalidInputRun = {
  type: 'AUTOMATED',
  name: 'TEST GPT4 ENDPOINT',
  description: 'Nth Simulation run by me',
  numConversations: 1,
  userAgentConfig: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
  serviceAgentConfig: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'gPT',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
};
const invalidInput2Run = {
  type: 'AUTOMATED',
  name: 'TEST GPT4 ENDPOINT',
  description: 'Nth Simulation run by me',
  numConversations: 1,
  userAgentConfig: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
  serviceAgent2Config: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
};

const validInputAB = {
  name: 'AB',
  description: 'AB TESTING',
  numConversations: 1,
  serviceAgentAConfig: {
    name: 'Temp service agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'default',
  },
  serviceAgentBConfig: {
    name: 'Temp service agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'default',
  },
  userAgentConfig: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
};
const invalidInputAB = {
  name: 'AB',
  description: 'AB TESTING',
  numConversations: 1,
  serviceAgentAConfig: {
    name: 'Temp service agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'default',
  },
  serviceAgentBConfig: {
    name: 'Temp service agent',
    domain: 'FLIGHT',
    llm: 'gpt',
    temperature: 0,
    maxTokens: 256,
    prompt: 'default',
  },
  userAgentConfig: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
};
const invalidInputAB2 = {
  name: 'AB',
  description: 'AB TESTING',
  numConversations: 1,
  serviceAgentAConfig: {
    name: 'Temp service agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'default',
  },
  serviceAgentConfig: {
    name: 'Temp service agent',
    domain: 'FLIGHT',
    llm: 'gpt',
    temperature: 0,
    maxTokens: 256,
    prompt: 'default',
  },
  userAgentConfig: {
    name: 'Temp user agent',
    domain: 'FLIGHT',
    llm: 'FAKE',
    temperature: 0,
    maxTokens: 256,
    prompt: 'sarcastic',
  },
};

describe('POST /api/v1/simulation/run', () => {
  let validResponse: Response;
  let invalidResponse: Response;
  let invalidResponse2: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).post('/api/v1/simulation/run').send(validInputRun);
    invalidResponse = await request(HOSTNAME).post('/api/v1/simulation/run').send(invalidInputRun);
    invalidResponse2 = await request(HOSTNAME).post('/api/v1/simulation/run').send(invalidInput2Run);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
    invalidResponse2 = {} as Response;
  });

  it('should return 201 for valid input', () => {
    expect(validResponse.status).toBe(201);
  });

  it('should return 500 for invalid input', () => {
    expect(invalidResponse.status).toBe(500);
  });

  it('should return 400 for invalid input', () => {
    expect(invalidResponse2.status).toBe(400);
  });
});

describe('POST /api/v1/simulation/abtesting/run', () => {
  let validResponse: Response;
  let invalidResponse: Response;
  let invalidResponse2: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).post('/api/v1/simulation/abtesting/run').send(validInputAB);
    invalidResponse = await request(HOSTNAME).post('/api/v1/simulation/abtesting/run').send(invalidInputAB);
    invalidResponse2 = await request(HOSTNAME).post('/api/v1/simulation/abtesting/run').send(invalidInputAB2);
  });

  afterEach(() => {
    validResponse = {} as Response;
    invalidResponse = {} as Response;
    invalidResponse2 = {} as Response;
  });

  it('should return 201 for valid input', () => {
    expect(validResponse.status).toBe(201);
  });

  it('should return 500 for invalid input', () => {
    expect(invalidResponse.status).toBe(500);
  });

  it('should return 400 for invalid input', () => {
    expect(invalidResponse2.status).toBe(400);
  });
});

describe('GET /api/v1/simulation/all', () => {
  let validResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).get(`/api/v1/simulation/all`);
    validSimulationId = validResponse.body[0]._id;
    deleteValidSimulationId = validResponse.body[1]._id;

    for (const e of validResponse.body) {
      if (e.conversations && e.conversations.length > 0) {
        const firstConversation = e.conversations[0];
        validConversation = firstConversation;
        break;
      }
    }
  });

  afterEach(() => {
    validResponse = {} as Response;
  });

  it('should return 200 for valid simulation ID', () => {
    expect(validResponse.status).toBe(200);
  });
});

describe('GET /api/v1/simulation/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).get(`/api/v1/simulation/${validSimulationId}`);
    invalidResponse = await request(HOSTNAME).get(`/api/v1/simulation/${invalidSimulationId}`);
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

describe('GET /api/v1/simulation/conversation/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(HOSTNAME).get(`/api/v1/simulation/conversation/${validConversation}`);
    invalidResponse = await request(HOSTNAME).get(`/api/v1/simulation/conversation/${invalidSimulationId}`);
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

describe('PUT /api/v1/simulation/:id', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    const obj = {
      name: 'test',
    };
    validResponse = await request(HOSTNAME).put(`/api/v1/simulation/${validSimulationId}`).send(obj);

    // was failing because the domain type couldn't pass the validation check
    invalidResponse = await request(HOSTNAME).put(`/api/v1/simulation/${invalidSimulationId}`).send(obj);
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
    validResponse = await request(HOSTNAME).delete(`/api/v1/simulation/${deleteValidSimulationId}`);
    invalidResponse = await request(HOSTNAME).delete(`/api/v1/simulation/${invalidSimulationId}`);
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
/*
afterAll(() => {
  server.close(async () => {
    await disconnectFromDatabase();
  });
});
*/
