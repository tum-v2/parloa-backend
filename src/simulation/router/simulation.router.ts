// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import simulationController from '../api/simulation.controller';
import SimulationValidator from '../validator/simulation.validator';
import CustomValidationError from '../validator/error.validator';

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
// region GET //

// region PATCH //
router.patch(
  '/:id',
  SimulationValidator.runValidation(),
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.update,
);
// endregion PATCH //

// region DELETE //
router.delete(
  '/:id',
  SimulationValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  simulationController.del,
);
// endregion DELETE //

export default router;
