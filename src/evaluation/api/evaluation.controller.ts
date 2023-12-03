// Controller that implements evaluation related endpoints
import { ConversationDocument, ConversationModel } from '@simulation/db/models/conversation.model';
import { SimulationDocument, SimulationModel } from '@simulation/db/models/simulation.model';
import simulationService from '@simulation/service/simulation.service';
import evaluationService from 'evaluation/service/evaluation.service';
import { EvaluationDocument } from 'evaluation/db/models/evaluation.model';
import { RunEvaluationRequest } from 'evaluation/model/request/run-evaluation.request';
import { Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR } from 'simulation/utils/errors';
import { validationResult } from 'express-validator';
import { ConversationRepository } from '@simulation/db/repositories/conversation.repository';
import {
  EvaluationResultForConversation,
  EvaluationResultForSimulation,
} from 'evaluation/model/request/evaluation-result.response';
import { SimulationRepository } from '@simulation/db/repositories/simulation.repository';
import { RunEvaluationResponse } from 'evaluation/model/request/run-evaluation.response';

const conversationRepository = new ConversationRepository(ConversationModel);
const simulationRepository = new SimulationRepository(SimulationModel);

/**
 * Triggers the evaluation of one conversation and - if specified - the optimization of the whole simulation
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
    const conversationID = evaluationConfig.conversation;
    const simulationID = evaluationConfig.simulation;
    const conversation: ConversationDocument | null = await conversationRepository.getById(conversationID);

    if (!conversation) {
      res.status(404).send({ error: `Conversation ${conversationID} not found!` });
      return;
    }

    const simulation: SimulationDocument | null = await simulationService.poll(simulationID);

    if (!simulation) {
      res.status(404).send({ error: `Simulation ${simulationID} not found!` });
      return;
    } else if (!simulation.conversations.find((c) => c.toString() === conversationID)) {
      res.status(400).send({ error: `Conversation ${conversationID} does not belong to Simulation ${simulationID}` });
      return;
    }

    const evaluation: EvaluationDocument = await evaluationService.initiate(evaluationConfig, conversation, simulation);
    const responseObject: RunEvaluationResponse = {
      optimization: evaluationConfig.optimization,
      simulation: simulationID,
      evaluation: evaluation.id,
    };
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
    const simulation: SimulationDocument | null = await simulationRepository.getById(simulationID);

    if (!simulation) {
      res.status(404).send({ error: `Simulation ${simulationID} not found` });
      return;
    }

    const results: EvaluationResultForSimulation = await evaluationService.getResultsForSimulation(simulation);
    res.status(200).send(results);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default { run, resultsForConversation, resultsForSimulation };
