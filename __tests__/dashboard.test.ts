import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();
const HOSTNAME = `http://localhost:${process.env.NODE_DOCKER_PORT}`;

let token: string = '';

beforeAll(async () => {
  const accessCode = process.env.LOGIN_ACCESS_CODE;
  const loginResponse = await request(HOSTNAME).post('/api/v1/auth/login').send({ accessCode: accessCode });
  token = loginResponse.body.token;
});

describe('GET /dashboard', () => {
  it('responds with the dashboard data', async () => {
    const response = await request(HOSTNAME)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .query({ days: 7 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      interactions: expect.any(Number),
      simulationRuns: expect.any(Number),
      successRate: expect.any(Number),
      simulationSuccessGraph: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          successRate: expect.any(Number),
          date: expect.any(Number), // UNIX timestamp
        }),
      ]),
      top10Simulations: expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          createdAt: expect.any(String),
          successRate: expect.any(Number),
          domain: expect.any(String),
        }),
      ]),
    });
  });
});
