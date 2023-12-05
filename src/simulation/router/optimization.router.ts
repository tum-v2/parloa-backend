// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import optimizationController from '../api/optimization.controller';
import SimulationValidator from '../validator/simulation.validator';
import CustomValidationError from '../validator/error.validator';

// region POST //
router.post(
  '/run',
  SimulationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  optimizationController.run,
);
// endregion POST //

router.get('/:id', optimizationController.get);

export default router;
