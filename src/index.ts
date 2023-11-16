import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { logger } from './simulation/service/logging-service';
import { connectToDatabase } from './simulation/db/config/db.config';

// routers
import simulationRouter from '../src/simulation/router/simulation.router';
import chatRouter from '../src/simulation/router/chat.router';
import authRouter from './simulation/router/auth.router';
import dashRouter from './simulation/router/dashboard.router';
import llmRouter from './simulation/router/llms.router';

import { swaggerOptions } from './simulation/docs/swagger.options';
import simulationValidator from './simulation/validator/simulation.validator';

const specs = swaggerJsdoc(swaggerOptions);
const app = express();
const port = process.env.NODE_DOCKER_PORT || 3000;

app.use(bodyParser.json());
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/v1/simulation', simulationRouter);
app.use('api/v1/chat', chatRouter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashRouter);
app.use('/api/v1/llm', llmRouter);

app.use(simulationValidator.handleValidationErrors);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

app.listen(port, async () => {
  await connectToDatabase();
  logger.info(`Server running at http://localhost:${port}`);
});
