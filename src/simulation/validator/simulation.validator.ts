import { body, param, ValidationChain, ValidationError, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../service/logging.service';

import { ConversationType, ConversationDomain, SimulationScenario } from '../db/enum/enums';

class CustomValidationError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super('API Input Validation failed');
    this.name = 'CustomValidationError';
    this.errors = errors;
  }
}

class simulationValidator {
  /**
   * Validate the request body for the /run endpoint
   */
  static runValidation(): ValidationChain[] {
    return [
      body('user').isMongoId().withMessage('User id must be a valid Mongo id.'),
      body('name').isString().withMessage('Simulation name must be a valid string.'),
      body('scenario')
        .isIn(Object.values(SimulationScenario))
        .withMessage(`Invalid scenario type. Must be one of: ${Object.values(SimulationScenario).join(', ')}`),
      body('type')
        .isIn(Object.values(ConversationType))
        .withMessage(`Invalid simulation type. Must be one of: ${Object.values(ConversationType).join(', ')}`),
      body('domain')
        .isIn(Object.values(ConversationDomain))
        .withMessage(`Invalid domain type. Must be one of: ${Object.values(ConversationDomain).join(', ')}`),
      body('numConversations').isInt().withMessage('Number of conversations must be a valid integer.'),
      body('serviceAgentConfig').isObject().withMessage('Service agent configuration must be an object.'),
      body('serviceAgentConfig.llm').isString().withMessage('Service agent model must be a valid string.'),
      body('serviceAgentConfig.temperature')
        .isNumeric()
        .withMessage('Service agent temperature must be a valid number.'),
      body('serviceAgentConfig.maxTokens').isNumeric().withMessage('Service agent maxTokens must be a valid number.'),
      body('serviceAgentConfig.prompt').isString().withMessage('Service agent prompt must be a valid string.'),
      body('userAgentConfig').isObject().withMessage('User agent configuration must be an object.'),
      body('userAgentConfig.llm').isString().withMessage('User agent model must be a valid string.'),
      body('userAgentConfig.temperature').isNumeric().withMessage('User agent temperature must be a valid number.'),
      body('userAgentConfig.maxTokens').isNumeric().withMessage('User agent maxTokens must be a valid number.'),
      body('userAgentConfig.prompt').isString().withMessage('User agent prompt must be a valid string.'),

      body().custom((value, { req }) => {
        const allowedFields = [
          'user',
          'name',
          'scenario',
          'type',
          'domain',
          'numConversations',
          'serviceAgentConfig',
          'userAgentConfig',
        ];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Validate the request parameters for the /{simulationId}/poll,
   * /{simulationId}/details, and /{simulationId}/conversations endpoints
   */
  static idValidation(): ValidationChain[] {
    return [param('id').isMongoId().withMessage('Invalid simulation ID.')];
  }

  /**
   * Middleware to handle validation errors
   */
  static handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error: ValidationError) => error.msg);
      const customError = new CustomValidationError(errorMessages);
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: customError.message,
          errors: customError.errors,
        },
      });
      logger.error(`${customError.message}: ${customError.errors}`);
      return;
    }

    next();
  }
}

export default simulationValidator;
