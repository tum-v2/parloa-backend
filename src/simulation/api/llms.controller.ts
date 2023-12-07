/* eslint-disable require-jsdoc */
import { Request, Response } from 'express';
import { LLMModel } from '@simulation/db/enum/enums';

/**
 * Get all LLMs
 * @param req - Request
 * @param res - Response
 */
async function getLLMs(req: Request, res: Response): Promise<void> {
  res.status(200).send(Object.values(LLMModel));
}

export default {
  getLLMs,
};
