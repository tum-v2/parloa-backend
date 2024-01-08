import { body, param, ValidationChain } from 'express-validator';
import AgentValidator from '@simulation/validator/agent.validator';

class ChatValidator {
  /**
   * Validate the request body for the /chat endpoint
   * @returns Validation chain array that checks simulation run request
   */
  static runValidation(): ValidationChain[] {
    const validations: ValidationChain[] = [
      body('name').isString().withMessage('Name must be a valid string.'),
      body('agentId').optional().isMongoId().withMessage('Agent id must be a valid Mongo id.'),
      body('agentConfig').optional().isObject().withMessage('Agent config must be a valid object.'),
    ];

    if (body('agentConfig').exists()) {
      const validationRules = AgentValidator.agentConfigFieldsValidation('agentConfig');
      validations.push(...validationRules);
    }

    validations.push(
      body().custom((value) => {
        if (value.agentId && value.agentConfig) {
          throw new Error('Cannot have agentConfig and agentId at the same time.');
        }

        if (!value.agentId && !value.agentConfig) {
          throw new Error('Must have agentConfig or agentId.');
        }

        return true;
      }),
    );

    validations.push(
      body().custom((value, { req }) => {
        const allowedFields = ['name', 'agentId', 'agentConfig'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    );

    return validations;
  }

  /**
   * Validate the request body for /:id/send-message endpoint
   * @returns Validation chain array that checks simulation run request
   */
  static messageValidation(): ValidationChain[] {
    return [
      body('message').isString().withMessage('Message sent must be a valid string.'),

      body().custom((value, { req }) => {
        const allowedFields = ['message'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Validate the request parameter /:id for get, load, send-message, end, update, delete endpoints
   * @returns Validation chain array that checks simulation run request
   */
  static idValidation(): ValidationChain[] {
    return [param('id').isMongoId().withMessage('Invalid agent ID.')];
  }
}

export default ChatValidator;
