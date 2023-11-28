// Controller that implements evaluation related endpoints
import { Request, Response } from 'express';
import { logger } from '../service/logging.service';
import { INTERNAL_SERVER_ERROR } from '../utils/errors';
import { EvaluationDocument } from '../db/models/evaluation.model';
import evaluationService from '../service/evaluation.service';

/**
 * Runs the evaluation for a specific conversation and simulation.
 * @param req - Request object
 * @param res - Response object
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function run(req: Request, res: Response): Promise<void> {
  try {
    const { conversationId, simulationId } = req.body;

    if (!conversationId) {
      res.status(400).send({ error: 'conversationId is required!' });
      return;
    }

    if (!simulationId) {
      res.status(400).send({ error: 'simulationId is required!' });
      return;
    }

    const evaluation: EvaluationDocument = await evaluationService.runEvaluation(conversationId, simulationId);
    res.status(201).send(evaluation);
  } catch (error) {
    logger.error(`Evaluation failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default { run };
