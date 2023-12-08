import express from 'express';

import optimizationController from '@simulation/api/optimization.controller';
import SimulationValidator from '@simulation/validator/simulation.validator';
import CustomValidationError from '@simulation/validator/error.validator';

const router = express.Router();

// region POST //
router.post(
  '/run',
  SimulationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  optimizationController.run,
);
// endregion POST //

// region GET //
router.get('/:id', optimizationController.get);
// endregion GET //

export default router;
