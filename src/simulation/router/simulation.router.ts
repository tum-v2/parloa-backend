import express from 'express';

import simulationController from '@simulation/api/simulation.controller';
import SimulationValidator from '@simulation/validator/simulation.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';

const router = express.Router();

// POST //
router.post(
  '/run',
  SimulationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.run,
);

router.post(
  '/abtesting/run',
  SimulationValidator.abValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.runABTesting,
);

// GET //
router.get('/all', simulationController.getAll);

router.get(
  '/:id',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.poll,
);
router.get(
  '/conversation/:id',
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
