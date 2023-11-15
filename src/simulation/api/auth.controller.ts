/* eslint-disable require-jsdoc */
// Controller that implements authentication
import { Request, Response } from 'express';

async function login(req: Request, res: Response) {
  const { accessCode } = req.body;

  if (!accessCode) {
    res.status(500).send('Please provide an accessCode.');
    return;
  }
  if (!process.env.LOGIN_ACCESS_CODE) {
    throw new Error('Missing required environment variable: LOGIN_ACCESS_CODE');
  }
  const codeCorrect: boolean = accessCode === process.env.LOGIN_ACCESS_CODE;
  res.status(200).send({ succes: codeCorrect });
}

export default {
  login,
};
