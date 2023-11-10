import dotenv from 'dotenv'; 
dotenv.config();  // Load environment variables from .env file 

import express, { Request, Response } from 'express';


const app = express();
const port = process.env.NODE_DOCKER_PORT || 8080;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
