import express from 'express';

import simulationController from '@simulation/api/simulation.controller';
import SimulationValidator from '@simulation/validator/simulation.validator';
import CustomValidationError from '@simulation/validator/error.validator';

const router = express.Router();

// region POST //
router.post(
  '/run',
  SimulationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.run,
);

router.post('/abtesting/run', simulationController.runABTesting);
// endregion POST //

// region GET //
router.get(
  '/:id/poll',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.poll,
);
router.get(
  '/:id/conversations',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.getConversations,
);
router.get('/all', simulationController.getAll);
router.get('/conversation/:id', simulationController.getConversation);
// endregion GET //

// region PUT//
router.patch(
  '/:id',
  SimulationValidator.idValidation(),
  SimulationValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.update,
);
// endregion PUT //

// region DELETE //
router.delete(
  '/:id',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.del,
);
// endregion DELETE //

export default router;
