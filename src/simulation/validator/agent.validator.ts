import { body, param, ValidationChain } from 'express-validator';

import { LLMModel } from '@enums/llm-model.enum';
import { ConversationDomain } from '@enums/conversation-domain.enum';

class AgentValidator {
  /**
   * Validate the request body for the /agent endpoint
   * @returns Validation chain array that checks simulation run request
   */
  static runValidation(): ValidationChain[] {
    return [
      body('name').isString().withMessage('Name must be a valid string.'),
      body('llm')
        .isIn(Object.values(LLMModel))
        .withMessage(`Invalid model type. Must be one of: ${Object.values(LLMModel).join(', ')}`),
      body('temperature').isFloat().withMessage('Temperature must be a valid integer.'),
      body('maxTokens').isInt().withMessage('Max tokens must be a valid integer.'),
      body('domain')
        .isIn(Object.values(ConversationDomain))
        .withMessage(`Invalid domain type. Must be one of: ${Object.values(ConversationDomain).join(', ')}`),
      body('prompt').isString().withMessage('Prompt must be a valid string.'),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'llm', 'temperature', 'maxTokens', 'domain', 'prompt'];

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
   * @returns Validation chain array that checks simulation run request
   */
  static idValidation(): ValidationChain[] {
    return [param('id').isMongoId().withMessage('Invalid agent ID.')];
  }
}

export default AgentValidator;
