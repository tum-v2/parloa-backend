// Controller that implements evaluation related endpoints
import { ConversationDocument, ConversationModel } from '@simulation/db/models/conversation.model';
import { SimulationDocument, SimulationModel } from '@simulation/db/models/simulation.model';
import evaluationService from 'evaluation/service/evaluation.service';
import { RunEvaluationRequest } from 'evaluation/model/request/run-evaluation.request';
import { Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR } from 'simulation/utils/errors';
import { validationResult } from 'express-validator';
import { ConversationRepository } from '@simulation/db/repositories/conversation.repository';
import {
  EvaluationResultForConversation,
  EvaluationResultForSimulation,
  EvaluationStatus,
} from 'evaluation/model/request/evaluation-result.response';
import { SimulationRepository } from '@simulation/db/repositories/simulation.repository';
import { RunEvaluationResponse } from 'evaluation/model/request/run-evaluation.response';

const conversationRepository = new ConversationRepository(ConversationModel);
const simulationRepository = new SimulationRepository(SimulationModel);

/**
 * Triggers the evaluation of one conversation
 * @param req - Request object (RunEvaluationRequest)
 * @param res - Response object (returns the created evaluation object)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function run(req: Request, res: Response): Promise<void> {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).send({ error: validationErrors });
      return;
    }

    const evaluationConfig: RunEvaluationRequest = req.body as RunEvaluationRequest;
    const responseObject: RunEvaluationResponse = await evaluationService.runEvaluation(evaluationConfig);
    res.status(200).send(responseObject);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Retrieves the evaluation results for one conversation
 * @param req - Request object
 * @param res - Response object (of type EvaluationResultForConversation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function resultsForConversation(req: Request, res: Response): Promise<void> {
  try {
    const conversationID: string = req.params.conversationId;
    const conversation: ConversationDocument | null = await conversationRepository.getById(conversationID);

    if (!conversation) {
      res.status(404).send({ error: `Conversation ${conversationID} not found` });
      return;
    }

    const results: EvaluationResultForConversation = await evaluationService.getResultsForConversation(conversation);
    res.status(200).send(results);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Retrieves the evaluation results for one simulation
 * @param req - Request object
 * @param res - Response object (of type EvaluationResultForSimulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function resultsForSimulation(req: Request, res: Response): Promise<void> {
  try {
    const simulationID: string = req.params.simulationId;
    let simulation: SimulationDocument | null = await simulationRepository.getById(simulationID);

    if (!simulation) {
      res.status(404).send({ error: `Simulation ${simulationID} not found` });
      return;
    }

    simulation = await simulation.populate('evaluation');

    if (!simulation.evaluation) {
      res.status(200).send({ status: EvaluationStatus.NOT_EVALUATED });
      return;
    }

    const results: EvaluationResultForSimulation = await evaluationService.getResultsForSimulation(simulation);
    res.status(200).send(results);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default { run, resultsForConversation, resultsForSimulation };
