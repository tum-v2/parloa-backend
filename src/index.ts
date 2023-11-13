import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import { logger } from './simulation/service/logging-service';
import { connectToDatabase } from './simulation/db/config/db.config';

// routers
import simulationRouter from '../src/simulation/router/simulation.router';
import chatRouter from '../src/simulation/router/chat.router';

const app = express();
const port = process.env.NODE_DOCKER_PORT || 3000;

app.use(bodyParser.json());

app.use('/api/v1/simulation', simulationRouter);
app.use('api/v1/chat', chatRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

app.listen(port, async () => {
  await connectToDatabase();
  logger.info(`Server running at http://localhost:${port}`);
});
