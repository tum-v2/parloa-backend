import { Request, Response } from 'express';
import { LLMModel } from '@enums/llm-model.enum';
import { ConversationDomain } from '@enums/conversation-domain.enum';
import { BAD_REQUEST } from '@utils/errors';
import {
  USER_AGENT_FLIGHT_PROMPT,
  SERVICE_AGENT_FLIGHT_PROMPT,
  USER_AGENT_INSURANCE_PROMPT,
  SERVICE_AGENT_INSURANCE_PROMPT,
  PROMPT_NAMES_USER_AGENT,
  PROMPT_NAMES_SERVICE_AGENT,
} from '@simulation/config/defaults';

/**
 * Get prompt for a specific domain and agent
 * @param req - Request object.
 * @param res - Response object. It returns agent prompt.
 */
async function getPrompts(req: Request, res: Response): Promise<void> {
  if (!req.query.domain || !req.query.agentType) {
    res.status(400).send(BAD_REQUEST('Please provide a domain and agetType: e.g. ?domain=FLIGHT&agentType=USER'));
    return;
  }
  if (req.query.domain === ConversationDomain.FLIGHT) {
    if (req.query.agentType === 'USER') {
      res.status(200).send(USER_AGENT_FLIGHT_PROMPT);
    } else if (req.query.agentType === 'SERVICE') {
      res.status(200).send(SERVICE_AGENT_FLIGHT_PROMPT);
    } else {
      res.status(400).send({ error: `Agent type ${req.query.agentType} not found!` });
    }
  } else if (req.query.domain === ConversationDomain.INSURANCE) {
    if (req.query.agentType === 'USER') {
      res.status(200).send(USER_AGENT_INSURANCE_PROMPT);
    } else if (req.query.agentType === 'SERVICE') {
      res.status(200).send(SERVICE_AGENT_INSURANCE_PROMPT);
    } else {
      res.status(400).send({ error: `Agent type ${req.query.agentType} not found!` });
    }
  } else {
    res.status(400).send({ error: `Domain ${req.query.domain} not found!` });
  }
}

/**
 * Get all LLMs
 * @param req - Request object.
 * @param res - Response object. It returns all LLMs.
 */
async function getLLMs(req: Request, res: Response): Promise<void> {
  res.status(200).send(Object.values(LLMModel));
}

/**
 * Get all domains
 * @param req - Request object.
 * @param res - Response object. It returns all domains.
 */
async function getDomains(req: Request, res: Response): Promise<void> {
  res.status(200).send(Object.values(ConversationDomain));
}

/**
 * Get propmt names for a specific agent
 * @param req - Request object.
 * @param res - Response object. It returns all prompt names for an agent.
 */
async function getPromptNames(req: Request, res: Response): Promise<void> {
  if (!req.query.agentType) {
    res.status(400).send(BAD_REQUEST('Please provide agetType: e.g. ?agentType=USER'));
    return;
  }
  if (req.query.agentType === 'USER') {
    res.status(200).send(PROMPT_NAMES_USER_AGENT);
  } else if (req.query.agentType === 'SERVICE') {
    res.status(200).send(PROMPT_NAMES_SERVICE_AGENT);
  } else {
    res.status(400).send({ error: `Agent type ${req.query.agentType} not found!` });
  }
}

export default {
  getLLMs,
  getPrompts,
  getDomains,
  getPromptNames,
};
