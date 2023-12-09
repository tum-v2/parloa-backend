import express from 'express';

import chatController from '@simulation/api/chat.controller';
import ChatValidator from '@simulation/validator/chat.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';

const router = express.Router();

// region POST //
router.post(
  '/start',
  ChatValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.start,
);
router.post(
  '/:id/load',
  ChatValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.load,
);
router.post(
  '/:id/send-message',
  ChatValidator.idValidation(),
  ChatValidator.messageValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.sendMessage,
);
// endregion POST //

// region GET //
router.get('/all', chatController.getAll);
router.get('/:id', ChatValidator.idValidation(), CustomValidationError.handleValidationErrors, chatController.get);
router.get('/:id/end', ChatValidator.idValidation(), CustomValidationError.handleValidationErrors, chatController.end);
// region GET //

// region PUT //
router.put(
  '/:id',
  ChatValidator.idValidation(),
  ChatValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  chatController.update,
);
// endregion PUT //

// region DELETE //
router.delete('/:id', ChatValidator.idValidation(), CustomValidationError.handleValidationErrors, chatController.del);
// endregion DELETE //

export default router;
