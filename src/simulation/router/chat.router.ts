import express from 'express';

import chatController from '@simulation/api/chat.controller';
import ChatValidator from '@simulation/validator/chat.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';

const router = express.Router();

// POST //
router.post('/', ChatValidator.runValidation(), CustomValidationError.handleValidationErrors, chatController.start);
router.post(
  '/:id',
  ChatValidator.idValidation(),
  ChatValidator.messageValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.sendMessage,
);

// GET //
router.get('/:id', ChatValidator.idValidation(), CustomValidationError.handleValidationErrors, chatController.load);
router.get('/', chatController.getAll);

export default router;
