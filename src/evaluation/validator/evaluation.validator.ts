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
      body('conversation').isMongoId().withMessage('Invalid conversation ID'),
      body('simulation').isMongoId().withMessage('Invalid simulation ID'),
      body('isLast').isBoolean().withMessage('isLast must be a valid boolean'),
      body('optimization').isMongoId().withMessage('Invalid optimization ID'),

      body().custom((value, { req }) => {
        const allowedFields = ['conversation', 'simulation', 'isLast', 'optimization'];

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
