import express from 'express';

import optimizationController from '@simulation/api/optimization.controller';
import SimulationValidator from '@simulation/validator/simulation.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';
const router = express.Router();

// POST //
router.post(
  '/',
  SimulationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  optimizationController.run,
);

// GET //
router.get(
  '/:id',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  optimizationController.get,
);

export default router;
