import { body, param, ValidationChain } from 'express-validator';
import { SimulationType, SimulationScenario } from '@simulation/db/enum/enums';

class SimulationValidator {
  /**
   * Validate the request body for the /run endpoint
   * @returns Validation chain array that checks simulation run request
   */
  static runValidation(): ValidationChain[] {
    return [
      body('name').isString().withMessage('Simulation name must be a valid string.'),
      body('scenario')
        .isIn(Object.values(SimulationScenario))
        .withMessage(`Invalid scenario type. Must be one of: ${Object.values(SimulationScenario).join(', ')}`),
      body('type')
        .isIn(Object.values(SimulationType))
        .withMessage(`Invalid simulation type. Must be one of: ${Object.values(SimulationType).join(', ')}`),
      body('numConversations').isInt().withMessage('Number of conversations must be a valid integer.'),
      //body('serviceAgentId').isString().withMessage('Service agent configuration must be an ID string.'),
      //body('userAgentId').isString().withMessage('User agent configuration must be an ID string.'),
      //TODO

      body().custom((value, { req }) => {
        const allowedFields = [
          'name',
          'description',
          'scenario',
          'type',
          'numConversations',
          'serviceAgentId',
          'userAgentId',
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
   * Validate the request parameters for the /:id/poll,
   * /:id/details, and /:id/conversations endpoints
   * @returns Validation chain array that checks simulation run request
   */
  static idValidation(): ValidationChain[] {
    return [param('id').isMongoId().withMessage('Invalid simulation ID.')];
  }
}

export default SimulationValidator;
