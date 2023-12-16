import { body, param, ValidationChain } from 'express-validator';

import { SimulationType } from '@enums/simulation-type.enum';

class SimulationValidator {
  /**
   * Validate the request body for the /run endpoint
   * @returns Validation chain array that checks simulation run request
   */
  static runValidation(): ValidationChain[] {
    return [
      body('name').isString().withMessage('Simulation name must be a valid string.'),
      body('type')
        .isIn(Object.values(SimulationType))
        .withMessage(`Invalid simulation type. Must be one of: ${Object.values(SimulationType).join(', ')}`),
      body('numConversations')
        .isInt({ min: 1, max: 1 })
        .withMessage('Number of conversations must be a valid integer between 1 and 100.'),

      // these are not required, but if they are present, they must be valid mongo IDs
      body('serviceAgentId').optional().isMongoId().withMessage('Service agent ID must be a valid ID.'),
      body('userAgentId').optional().isMongoId().withMessage('User agent ID must be a valid ID.'),

      // these are not required, but if they are present, they must be objects
      body('serviceAgentConfig').optional().isObject().withMessage('Service agent config must be a valid object.'),
      body('userAgentConfig').optional().isObject().withMessage('User agent config must be a valid object.'),

      // body cannot have userAgentConfig and userAgentId at the same time, but one of them is required
      body().custom((value) => {
        if (value.userAgentConfig && value.userAgentId) {
          throw new Error('Cannot have userAgentConfig and userAgentId at the same time.');
        }

        if (!value.userAgentConfig && !value.userAgentId) {
          throw new Error('Must have userAgentConfig or userAgentId.');
        }

        return true;
      }),

      // and same for service agent
      body().custom((value) => {
        if (value.serviceAgentConfig && value.serviceAgentId) {
          throw new Error('Cannot have serviceAgentConfig and serviceAgentId at the same time.');
        }

        if (!value.serviceAgentConfig && !value.serviceAgentId) {
          throw new Error('Must have serviceAgentConfig or serviceAgentId.');
        }

        return true;
      }),

      body().custom((value, { req }) => {
        const allowedFields = [
          'name',
          'description',
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
   * Validate the request body for the /abtesting/run endpoint
   * @returns Validation chain array that checks simulation run request
   */
  static abValidation(): ValidationChain[] {
    return [
      body('name').isString().withMessage('Simulation name must be a valid string.'),
      body('numConversations').isInt().withMessage('Number of conversations must be a valid integer.'),

      // these are not required, but if they are present, they must be valid mongo IDs
      body('serviceAgentAId').optional().isMongoId().withMessage('Service agent A ID must be a valid ID.'),
      body('serviceAgentBId').optional().isMongoId().withMessage('Service agent B ID must be a valid ID.'),
      body('userAgentId').optional().isMongoId().withMessage('User agent ID must be a valid ID.'),

      // these are not required, but if they are present, they must be objects
      body('serviceAgentAConfig').optional().isObject().withMessage('Service agent config must be a valid object.'),
      body('serviceAgentBConfig').optional().isObject().withMessage('Service agent config must be a valid object.'),
      body('userAgentConfig').optional().isObject().withMessage('User agent config must be a valid object.'),

      // body cannot have userAgentConfig and userAgentId at the same time, but one of them is required
      body().custom((value) => {
        if (value.userAgentConfig && value.userAgentId) {
          throw new Error('Cannot have userAgentConfig and userAgentId at the same time.');
        }

        if (!value.userAgentConfig && !value.userAgentId) {
          throw new Error('Must have userAgentConfig or userAgentId.');
        }

        return true;
      }),

      // and same for service agent A and B
      body().custom((value) => {
        if (value.serviceAgentAConfig && value.serviceAgentAId) {
          throw new Error('Cannot have serviceAgentAConfig and serviceAgenAtId at the same time.');
        }

        if (!value.serviceAgentAConfig && !value.serviceAgentAId) {
          throw new Error('Must have serviceAgentAConfig or serviceAgentAId.');
        }

        return true;
      }),

      body().custom((value) => {
        if (value.serviceAgentBConfig && value.serviceAgentBId) {
          throw new Error('Cannot have serviceAgentBConfig and serviceAgentBId at the same time.');
        }

        if (!value.serviceAgentBConfig && !value.serviceAgentBId) {
          throw new Error('Must have serviceAgentBConfig or serviceAgentBId.');
        }

        return true;
      }),

      body().custom((value, { req }) => {
        const allowedFields = [
          'name',
          'description',
          'numConversations',
          'serviceAgentAId',
          'serviceAgentBId',
          'userAgentId',
          'serviceAgentAConfig',
          'serviceAgentBConfig',
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
   * Validate the request body for the :id/update endpoint
   * @returns Validation chain array that checks simulation update request
   */
  static updateValidation(): ValidationChain[] {
    return [
      body('name').optional().isString().withMessage('Simulation name must be a valid string.'),
      body('description').optional().isString().withMessage('Simulation description must be a valid string.'),

      // body should not be empty object
      body().custom((value, { req }) => {
        if (Object.keys(req.body).length === 0) {
          throw new Error('No fields to update.');
        }

        return true;
      }),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'description'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Validate the request parameters for the /:id/,
   * /:id/update, and /:id/delete endpoints
   * @returns Validation chain array that checks simulation id
   */
  static idValidation(): ValidationChain[] {
    return [param('id').isMongoId().withMessage('Invalid simulation ID.')];
  }
}

export default SimulationValidator;
