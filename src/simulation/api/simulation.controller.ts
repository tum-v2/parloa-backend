// Controller that implements simulation related endpoints
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { RunABTestingRequest } from '@simulation/model/request/run-ab-testing.request';
import { RunSimulationRequest } from '@simulation/model/request/simulation.request';

import { SimulationDocument } from '@simulation/db/models/simulation.model';
import simulationService from '@simulation/service/simulation.service';
import { logger } from '@simulation/service/logging.service';
import { ConversationDocument } from '@simulation/db/models/conversation.model';

import { INTERNAL_SERVER_ERROR } from '@simulation/utils/errors';
import repositoryFactory from '@simulation/db/repositories/factory';

const messageRepository = repositoryFactory.messageRepository;

/**
 * Runs the simulation.
 * @param req - Request object (RunSimulationRequest)
 * @param res - Response object (returns the created simulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function run(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: errors });
      return;
    }

    const simulationConfig: RunSimulationRequest = req.body as RunSimulationRequest;
    const simulation: SimulationDocument = await simulationService.initiate(simulationConfig);
    res.status(201).send(simulation);
  } catch (error) {
    logger.error(`Simulation run failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}
/**
 * Runs the simulation.
 * @param req - Request object (RunSimulationRequest)
 * @param res - Response object (returns the created simulations)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function runABTesting(req: Request, res: Response): Promise<void> {
  try {
    /* const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: errors });
      return;
    }*/

    const simulationConfig: RunABTestingRequest = req.body as RunABTestingRequest;
    const simulations: SimulationDocument[] = await simulationService.initiateAB(simulationConfig);
    res.status(201).send(simulations);
  } catch (error) {
    logger.error(`Simulation run failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Polls the current state of the simulation.
 * @param req - Request object
 * @param res - Response object (returns the fetched simulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function poll(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: errors });
      return;
    }

    const id: string = req.params.id;
    const simulation: SimulationDocument | null = await simulationService.poll(id);
    if (simulation) {
      res.status(200).send(simulation);
    } else {
      res.status(404).send({ error: `Simulation ${id} not found!` });
    }
  } catch (error) {
    logger.error(`Simulation poll failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets the conversations of the simulation.
 * @param req - Request object
 * @param res - Response object (returns the conversations of the simulation)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function getConversations(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: errors });
      return;
    }

    const id: string = req.params.id;
    const conversations: ConversationDocument[] | null = await simulationService.getConversations(id);
    if (conversations) {
      res.status(200).send(conversations);
    } else {
      res.status(404).send({ error: `Simulation ${id} not found!` });
    }
  } catch (error) {
    logger.error(`Simulation fetch conversations failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets the conversations of the simulation.
 * @param req - Request object
 * @param res - Response object (returns all simulations)
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function getAll(req: Request, res: Response): Promise<void> {
  try {
    // TODO Apply filters if needed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: errors });
      return;
    }

    const simulations: SimulationDocument[] = await simulationService.getAll();
    res.status(200).send(simulations);
  } catch (error) {
    logger.error(`All simulations fetch failed! ${error}`);
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Gets the conversation of the simulation.
 * @param req - Request object
 * @param res - Response object (returns the conversation of the simulation)
 */
async function getConversation(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const conversation: ConversationDocument | null = await simulationService.getConversation(id);
    if (conversation) {
      const modifiedConversation: any = {};
      const messages: any[] = [];
      for (const messageId of conversation.messages) {
        const message: any = await messageRepository.getById(messageId as unknown as string);
        if (message.sender === 'TOOL') {
          continue;
        }
        const modifiedMessage: any = {};
        modifiedMessage.sender = message.sender;
        modifiedMessage.text = message.text;
        modifiedMessage.timestamp = message.timestamp;
        modifiedMessage.userCanReply = true;
        messages.push(modifiedMessage);
      }
      modifiedConversation._id = conversation.id;
      modifiedConversation.startTime = conversation.startTime;
      modifiedConversation.endTime = conversation.endTime;
      modifiedConversation.status = conversation.status;
      modifiedConversation.messages = messages;
      res.status(200).send(modifiedConversation);
    } else {
      res.status(404).send({ error: `Conversation ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Updates the simulation attributes.
 * @param req - Request object (includes changed attributes)
 * @param res - Response object
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function update(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: errors });
      return;
    }

    const id: string = req.params.id;
    const updates: Partial<SimulationDocument> = req.body as Partial<SimulationDocument>;
    const updated: SimulationDocument | null = await simulationService.update(id, updates);
    if (updated) {
      res.status(200).send(updated);
    } else {
      res.status(404).send({ error: `Simulation ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

/**
 * Deletes the simulation.
 * @param req - Request object
 * @param res - Response object
 * @throws Throws an internal server error if there is an issue with the operation.
 */
async function del(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: errors });
      return;
    }

    const id: string = req.params.id;
    const success: boolean = await simulationService.del(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: `Simulation ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  run,
  runABTesting,
  poll,
  getConversations,
  getAll,
  getConversation,
  update,
  del,
};
