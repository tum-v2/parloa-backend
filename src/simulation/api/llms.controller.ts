/* eslint-disable require-jsdoc */
import { Request, Response } from 'express';
import { LLMModel } from '../db/enum/enums';

async function getLLMs(req: Request, res: Response) {
  // TODO
  const list: LLMModel[] = [];
  res.status(200).send(list);
}

export default {
  getLLMs,
};
