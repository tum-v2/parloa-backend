import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

// routers
import simulationRouter from '../src/simulation/router/simulation.router';
import chatRouter from '../src/simulation/router/chat.router';
import authRouter from './simulation/router/auth.router';
import dashRouter from './simulation/router/dashboard.router';
import llmRouter from './simulation/router/llms.router';

const app = express();
const port = process.env.NODE_DOCKER_PORT || 3000;

app.use(bodyParser.json());

app.use('/api/v1/simulation', simulationRouter);
app.use('api/v1/chat', chatRouter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashRouter);
app.use('/api/v1/llm', llmRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
