import express from 'express';

import simulationController from '@simulation/api/simulation.controller';
import SimulationValidator from '@simulation/validator/simulation.validator';
import { CustomValidationError } from '@utils/handle-validation-errors';
import { verifyToken } from '@utils/auth-token';

const router = express.Router();

// POST //
router.post(
  '/',
  verifyToken,
  SimulationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.run,
);

router.post(
  '/ab-testing',
  verifyToken,
  SimulationValidator.abValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.runABTesting,
);

// GET //
router.get('/', verifyToken, simulationController.getAll);

router.get(
  '/:id',
  verifyToken,
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.poll,
);
router.get(
  '/conversations/:id',
  verifyToken,
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.getConversation,
);

// PUT //
router.put(
  '/:id',
  verifyToken,
  SimulationValidator.updateValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.update,
);

// DELETE //
router.delete(
  '/:id',
  verifyToken,
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.del,
);

export default router;
