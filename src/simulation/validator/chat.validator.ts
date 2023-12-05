import { body, param, ValidationChain } from 'express-validator';

class ChatValidator {
  /**
   * Validate the request body for the /chat endpoint
   * @returns Validation chain array that checks simulation run request
   */
  static runValidation(): ValidationChain[] {
    return [
      body('name').isString().withMessage('Name must be a valid string.'),
      body('serviceAgent').isMongoId().withMessage('Service agent id must be a valid Mongo id.'),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'serviceAgent'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
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
