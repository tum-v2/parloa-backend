/* eslint-disable require-jsdoc */
import { Request, Response } from 'express';
import LLM from '../model/llm.model';

async function getLLMs(req: Request, res: Response) {
  // TODO
  const list: LLM[] = [];
  res.status(200).send(list);
}

export default {
  getLLMs,
};
