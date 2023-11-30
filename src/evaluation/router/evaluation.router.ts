// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import evaluationController from 'evaluation/api/evaluation.controller';
import evaluationValidator from 'evaluation/validator/evaluation.validator';

// region POST //
router.post(
  '/run',
  evaluationValidator.runValidation(),
  evaluationValidator.handleValidationErrors,
  evaluationController.run,
);
// endregion POST //

export default router;
