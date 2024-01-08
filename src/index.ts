import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import merge from 'lodash.merge';
import cors from 'cors';

import { logger } from '@utils/logger';

import { connectToDatabase } from '@db/config/db.config';

import { CustomValidationError } from '@utils/handle-validation-errors';

// Simulation routers
import simulationRouter from '@simulation/router/simulation.router';
import chatRouter from '@simulation/router/chat.router';
import agentRouter from '@simulation/router/agent.router';
import goalRouter from '@simulation/router/goal.router';
import authRouter from '@simulation/router/auth.router';
import dashRouter from '@simulation/router/dashboard.router';
import dictionaryRouter from '@simulation/router/dictionary.router';
import optimizationRouter from '@simulation/router/optimization.router';

// Evaluation routers
import evaluationRouter from '@evaluation/router/evaluation.router';

const port = process.env.NODE_DOCKER_PORT || 3000;
const app = express();

app.use(
  cors({
    origin: '*',
  }),
);

// Load API specifications and merge them
const apiSpecSimulation = YAML.load('./src/simulation/docs/api.documentation.yaml');
const apiSpecEvaluation = YAML.load('./src/evaluation/docs/api.documentation.yaml');
const apiSpec = merge(apiSpecEvaluation, apiSpecSimulation);

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Serve API documentation
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec));

// Define routes
app.use('/api/v1/simulations', simulationRouter);
app.use('/api/v1/optimizations', optimizationRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/agents', agentRouter);
app.use('/api/v1/goals', goalRouter);
app.use('/api/v1/evaluations', evaluationRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashRouter);
app.use('/api/v1/dictionary', dictionaryRouter);

app.use(CustomValidationError.handleValidationErrors);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!!');
});

// Start server and connect to database
const server = app.listen(port, async () => {
  await connectToDatabase();
  //logger.info(`Server running at http://localhost:${port}`);
  logger.info(`Server running...`);
});

export { app, server };
