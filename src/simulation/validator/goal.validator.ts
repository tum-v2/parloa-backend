import { body, param, ValidationChain } from 'express-validator';

import { SimulationScenario } from '@enums/simulation-scenario.enum';

class GoalValidator {
  /**
   * Validate the request body for the create goal endpoint
   * @returns Validation chain array that checks goal creation request
   */
  static createValidation(): ValidationChain[] {
    return [
      body('name').isString().withMessage('Name must be a valid string.'),
      body('description').optional().isString().withMessage('Description must be a valid string.'),
      body('scenarios')
        // should be an array
        .isArray({ min: 1 })
        .withMessage('Scenarios must be a valid, non-empty array.')

        // should be an array of strings, do not accept any other type
        .custom((value) => value.every((scenario: string) => typeof scenario === 'string'))
        .withMessage('Scenarios must be an array of strings.')

        // should be an array of valid scenarios
        .custom((value) => {
          if (value) {
            const invalidScenarios = value.filter(
              (scenario: SimulationScenario) => !Object.values(SimulationScenario).includes(scenario),
            );

            if (invalidScenarios.length > 0) {
              throw new Error(`Invalid scenarios: ${invalidScenarios.join(', ')}`);
            }
          }
          return true;
        }),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'description', 'scenarios'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Validate the request body for the update goal endpoint
   * @returns Validation chain array that checks goal update request
   */
  static updateValidation(): ValidationChain[] {
    return [
      body().notEmpty().withMessage('At least one field must be provided.'),
      body('name').optional().isString().withMessage('Name must be a valid string.'),
      body('description').optional().isString().withMessage('Description must be a valid string.'),
      body('scenarios')
        .optional()
        // should be an array
        .isArray({ min: 1 })
        .withMessage('Scenarios must be a valid, non-empty array.')

        // should be an array of strings, do not accept any other type
        .custom((value) => value.every((scenario: string) => typeof scenario === 'string'))
        .withMessage('Scenarios must be an array of strings.')

        // should be an array of valid scenarios
        .custom((value) => {
          if (value) {
            const invalidScenarios = value.filter(
              (scenario: SimulationScenario) => !Object.values(SimulationScenario).includes(scenario),
            );

            if (invalidScenarios.length > 0) {
              throw new Error(`Invalid scenarios: ${invalidScenarios.join(', ')}`);
            }
          }
          return true;
        }),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'description', 'scenarios'];

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
   * @returns Validation chain array that checks valid goal ID
   */
  static idValidation(): ValidationChain[] {
    return [param('id').isMongoId().withMessage('Invalid agent ID.')];
  }
}

export default GoalValidator;
