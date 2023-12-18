import express from 'express';

import simulationController from '@simulation/api/simulation.controller';
import SimulationValidator from '@simulation/validator/simulation.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';

const router = express.Router();

// POST //
router.post(
  '/',
  SimulationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.run,
);

router.post(
  '/ab-testing',
  SimulationValidator.abValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.runABTesting,
);

// GET //
router.get('/', simulationController.getAll);

router.get(
  '/:id',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.poll,
);
router.get(
  '/conversations/:id',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.getConversation,
);

// PUT //
router.put(
  '/:id',
  SimulationValidator.updateValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.update,
);

// DELETE //
router.delete(
  '/:id',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.del,
);

export default router;
