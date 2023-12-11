import { Request, Response } from 'express';
import { LLMModel } from '@enums/llm-model.enum';

/**
 * Get all LLMs
 * @param req - Request object.
 * @param res - Response object. It returns all LLMs.
 */
async function getLLMs(req: Request, res: Response): Promise<void> {
  res.status(200).send(Object.values(LLMModel));
}

export default {
  getLLMs,
};
