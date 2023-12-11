import express from 'express';

import chatController from '@simulation/api/chat.controller';
import ChatValidator from '@simulation/validator/chat.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';

const router = express.Router();

// POST //
router.post(
  '/start',
  ChatValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.start,
);
router.post(
  '/:id/send-message',
  ChatValidator.idValidation(),
  ChatValidator.messageValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.sendMessage,
);

// GET //
router.get(
  '/:id/load',
  ChatValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.load,
);
router.get('/all', chatController.getAll);

export default router;
