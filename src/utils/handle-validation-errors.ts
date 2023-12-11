import { ValidationError, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

export class CustomValidationError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super('API Input Validation failed');
    this.name = 'CustomValidationError';
    this.errors = errors;
  }

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
