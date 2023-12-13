import { body, param, ValidationChain } from 'express-validator';

class EvaluationValidator {
  /**
   * Validate the request body for /run endpoint.
   * @returns ValidationChain[] - ValidationChain array that checks evaluation run request.
   */
  static runValidation(): ValidationChain[] {
    return [
      body('conversation').isMongoId().withMessage('Invalid conversation ID'),
      body('simulation').isMongoId().withMessage('Invalid simulation ID'),
      body('isLast').isBoolean().withMessage('isLast must be a valid boolean'),
      body('optimization').optional({ values: 'null' }).isMongoId().withMessage('Invalid optimization ID'),

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
   * Validate the parameter for the /results-for-conversation endpoint.
   * @returns ValidationChain[] - ValidationChain array that checks the request parameter.
   */
  static resultsForConversationValidation(): ValidationChain[] {
    return [param('conversationId').isMongoId().withMessage('Invalid conversation ID.')];
  }

  /**
   * Validate the parameter for the /results-for-simulation endpoint.
   * @returns ValidationChain[] - ValidationChain array that checks the request parameter.
   */
  static resultsForSimulationValidation(): ValidationChain[] {
    return [param('simulationId').isMongoId().withMessage('Invalid simulation ID')];
  }
}

export default EvaluationValidator;
