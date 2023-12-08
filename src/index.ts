import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

import { logger } from './utils/logger';
import { connectToDatabase } from './db/config/db.config';

// routers
import simulationRouter from '../src/simulation/router/simulation.router';
import chatRouter from '../src/simulation/router/chat.router';
import agentRouter from '../src/simulation/router/agent.router';
import authRouter from './simulation/router/auth.router';
import dashRouter from './simulation/router/dashboard.router';
import llmRouter from './simulation/router/llms.router';
import evaluationRouter from './evaluation/router/evaluation.router';
import optimizationRouter from './simulation/router/optimization.router';

import CustomValidationError from './simulation/validator/error.validator';

import cors from 'cors';

const apiSpec = YAML.load('./src/simulation/docs/api.documentation.yaml');

const app = express();
app.use(
  cors({
    origin: '*',
  }),
);

const port = process.env.NODE_DOCKER_PORT || 3000;

app.use(bodyParser.json());
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
app.use('/api/v1/simulation', simulationRouter);
app.use('/api/v1/optimization', optimizationRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/evaluation', evaluationRouter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashRouter);
app.use('/api/v1/llm', llmRouter);

app.use(CustomValidationError.handleValidationErrors);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!!');
});

const server = app.listen(port, async () => {
  await connectToDatabase();
  logger.info(`Server running at http://localhost:${port}`);
});

export { app, server };
