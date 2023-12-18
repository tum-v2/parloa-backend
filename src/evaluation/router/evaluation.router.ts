import express from 'express';

import evaluationController from '@evaluation/api/evaluation.controller';
import evaluationValidator from '@evaluation/validator/evaluation.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';

const router = express.Router();

// region GET //
router.get(
  '/conversations/:conversationId',
  evaluationValidator.resultsForConversationValidation(),
  CustomValidationError.handleValidationErrors,
  evaluationController.resultsForConversation,
);

router.get(
  '/simulations/:simulationId',
  evaluationValidator.resultsForSimulationValidation(),
  CustomValidationError.handleValidationErrors,
  evaluationController.resultsForSimulation,
);
// endregion GET //

// region POST //
router.post(
  '/',
  evaluationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  evaluationController.run,
);

router.post(
  '/simulations',
  evaluationValidator.runMultipleValidation(),
  CustomValidationError.handleValidationErrors,
  evaluationController.runMultiple,
);
// endregion POST //

export default router;
