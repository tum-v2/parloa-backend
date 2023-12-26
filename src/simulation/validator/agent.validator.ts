import { body, param, ValidationChain } from 'express-validator';

import { LLMModel } from '@enums/llm-model.enum';
import { ConversationDomain } from '@enums/conversation-domain.enum';
import { AgentType } from '@enums/agent-type.enum';

class AgentValidator {
  /**
   * Validate the request body for the create agent endpoint
   * @returns Validation chain array that checks agent creation request
   */
  static createValidation(): ValidationChain[] {
    return [
      body('name').isString().withMessage('Name must be a valid string.'),
      body('type')
        .isIn(Object.values(AgentType))
        .withMessage(`Invalid agent type. Must be one of: ${Object.values(AgentType).join(', ')}`),
      body('llm')
        .isIn(Object.values(LLMModel))
        .withMessage(`Invalid model type. Must be one of: ${Object.values(LLMModel).join(', ')}`),
      body('temperature').isFloat().withMessage('Temperature must be a valid integer.'),
      body('maxTokens').isInt().withMessage('Max tokens must be a valid integer.'),
      body('domain')
        .isIn(Object.values(ConversationDomain))
        .withMessage(`Invalid domain type. Must be one of: ${Object.values(ConversationDomain).join(', ')}`),
      body('prompt').isArray().withMessage('Prompt must be a valid array.'),
      body('goal').optional().isMongoId().withMessage('Invalid goal ID.'),

      // service agent must not have a goal
      body().custom((value, { req }) => {
        if (req.body.type === AgentType.SERVICE && req.body.goal) {
          throw new Error('Service agents must not have a goal.');
        }

        if (req.body.type === AgentType.USER && !req.body.goal) {
          throw new Error('User agents must have a goal.');
        }

        return true;
      }),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'type', 'llm', 'temperature', 'maxTokens', 'domain', 'prompt', 'goal'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Validate the request body for the update agent endpoint
   * @returns Validation chain array that checks agent update request
   */
  static updateValidation(): ValidationChain[] {
    return [
      body('name').optional().isString().withMessage('Name must be a valid string.'),
      body('type')
        .optional()
        .isIn(Object.values(AgentType))
        .withMessage(`Invalid agent type. Must be one of: ${Object.values(AgentType).join(', ')}`),
      body('llm')
        .optional()
        .isIn(Object.values(LLMModel))
        .withMessage(`Invalid model type. Must be one of: ${Object.values(LLMModel).join(', ')}`),
      body('temperature').optional().isFloat().withMessage('Temperature must be a valid integer.'),
      body('maxTokens').optional().isInt().withMessage('Max tokens must be a valid integer.'),
      body('domain')
        .optional()
        .isIn(Object.values(ConversationDomain))
        .withMessage(`Invalid domain type. Must be one of: ${Object.values(ConversationDomain).join(', ')}`),
      body('prompt').optional().isString().withMessage('Prompt must be a valid string.'),
      body('goal').optional().isMongoId().withMessage('Invalid goal ID.'),

      // service agent must not have a goal
      body().custom((value, { req }) => {
        if (req.body.type === AgentType.SERVICE && req.body.goal) {
          throw new Error('Service agents must not have a goal.');
        }

        if (req.body.type === AgentType.USER && !req.body.goal) {
          throw new Error('User agents must have a goal.');
        }

        return true;
      }),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'type', 'llm', 'temperature', 'maxTokens', 'domain', 'prompt', 'goal'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Validate the request parameter /:id for get, update and delete endpoints
   * @returns Validation chain array that checks valid agent ID
   */
  static idValidation(): ValidationChain[] {
    return [param('id').isMongoId().withMessage('Invalid agent ID.')];
  }
}

export default AgentValidator;
