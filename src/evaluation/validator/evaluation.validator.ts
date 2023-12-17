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

      body().custom((value, { req }) =>
        checkForAdditionalValues(req.body, ['conversation', 'simulation', 'isLast', 'optimization']),
      ),
    ];
  }

  static runMultipleValidation(): ValidationChain[] {
    return [
      body('simulations').isArray().withMessage('simulations must be an array'),
      body('simulations.*').isMongoId().withMessage('Invalid simulation ID in simulations'),

      body().custom((value, { req }) => checkForAdditionalValues(req.body, ['simulations'])),
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

/**
 * Checks whether the request body has unexpected fields
 * @param body - body to check for unexpected fields
 * @param allowedFields - allowed fields
 * @throws Error - if request body has unexpected fields
 * @returns true if request body has no unexpected fields
 */
function checkForAdditionalValues(body: object, allowedFields: string[]) {
  const extraFields = Object.keys(body).filter((field) => !allowedFields.includes(field));

  if (extraFields.length > 0) {
    throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
  }

  return true;
}

export default EvaluationValidator;
