import { Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR } from '@utils/errors';

/**
 * Handles the login request.
 * @param req - The request object.
 * @param res - The response object. Returns a success boolean.
 * @throws Throws an internal server error if access code is not provided.
 */
async function login(req: Request, res: Response): Promise<void> {
  const { accessCode } = req.body;

  if (!accessCode) {
    res.status(500).json(INTERNAL_SERVER_ERROR('Please provide an accessCode.'));
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
