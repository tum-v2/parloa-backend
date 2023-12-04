// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import evaluationController from 'evaluation/api/evaluation.controller';
import evaluationValidator from 'evaluation/validator/evaluation.validator';

// region GET //
router.get(
  '/results-for-conversation/:conversationId',
  evaluationValidator.resultsForConversationValidation(),
  evaluationValidator.handleValidationErrors,
  evaluationController.resultsForConversation,
);

router.get(
  '/results-for-simulation/:simulationId',
  evaluationValidator.resultsForSimulationValidation(),
  evaluationValidator.handleValidationErrors,
  evaluationController.resultsForSimulation,
);
// endregion GET //

// region POST //
router.post(
  '/run',
  evaluationValidator.runValidation(),
  evaluationValidator.handleValidationErrors,
  evaluationController.run,
);
// endregion POST //

export default router;
