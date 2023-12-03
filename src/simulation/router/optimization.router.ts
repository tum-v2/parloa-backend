// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import optimizationController from '../api/optimization.controller';
import simulationValidator from '../validator/simulation.validator';

// region POST //
router.post(
  '/run',
  simulationValidator.runValidation(),
  simulationValidator.handleValidationErrors,
  optimizationController.run,
);
// endregion POST //
export default router;
