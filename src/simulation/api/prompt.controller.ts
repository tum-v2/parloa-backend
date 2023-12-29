import { Request, Response } from 'express';
import { ConversationDomain } from '@enums/conversation-domain.enum';
import { BAD_REQUEST } from '@utils/errors';
import {
  USER_AGENT_FLIGHT_PROMPT,
  SERVICE_AGENT_FLIGHT_PROMPT,
  USER_AGENT_INSURANCE_PROMPT,
  SERVICE_AGENT_INSURANCE_PROMPT,
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

export default {
  getPrompts,
};
