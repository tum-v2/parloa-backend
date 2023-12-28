import express from 'express';

import chatController from '@simulation/api/chat.controller';
import ChatValidator from '@simulation/validator/chat.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';
import { verifyToken } from '@utils/auth-token';

const router = express.Router();

// POST //
router.post(
  '/',
  verifyToken,
  ChatValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.start,
);

router.post(
  '/:id',
  verifyToken,
  ChatValidator.idValidation(),
  ChatValidator.messageValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.sendMessage,
);

// GET //
router.get(
  '/:id',
  verifyToken,
  ChatValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.load,
);

router.get('/', verifyToken, chatController.getAll);

export default router;
