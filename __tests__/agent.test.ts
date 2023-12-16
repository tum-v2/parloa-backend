import request, { Response } from 'supertest';
import { app } from '../src/index';
//import { disconnectFromDatabase } from '@db/config/db.config';

const validInput = {
  name: 'TEST AGENT',
  llm: 'FAKE',
  temperature: 0,
  maxTokens: 250,
  domain: 'FLIGHT',
  prompt: 'concise',
  temporary: true,
};

const invalidInput = {
  name: 'TEST AGENT',
  llm: 'FAKE',
  temperature: 0,
  maxTokens: 250,
  domain: 'FLIGHT',
  prompt: 'concise',
  temporary: true,
};

describe('POST /api/v1/agent/', () => {
  let validResponse: Response;
  let invalidResponse: Response;

  beforeEach(async () => {
    validResponse = await request(app).post('/api/v1/agent/').send(validInput);
    invalidResponse = await request(app).post('/api/v1/agent/').send(invalidInput);
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
