import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain, ValidationError, validationResult } from 'express-validator';
import { logger } from '@simulation/service/logging.service';

class CustomValidationError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super('API Input Validation failed');
    this.name = 'CustomValidationError';
    this.errors = errors;
  }
}

class EvaluationValidator {
  /**
   * Validate the request body for /run endpoint
   * @returns Validation chain array that checks evaluation run request
   */
  static runValidation(): ValidationChain[] {
    return [
      body('conversationID').isMongoId().withMessage('Invalid conversation ID.'),
      body('simulationID').isMongoId().withMessage('Invalid simulation ID'),
      body('isLastConversation').isBoolean().withMessage('isLastConversation must be a valid boolean'),
      body('shouldOptimize').isBoolean().withMessage('shouldOptimize must be a valid boolean'),

      body().custom((value, { req }) => {
        const allowedFields = ['conversationID', 'simulationID', 'isLastConversation', 'shouldOptimize'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Middleware to handle validation errors
   * @param req - Request
   * @param res - Response
   * @param next - Next function
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

export default EvaluationValidator;