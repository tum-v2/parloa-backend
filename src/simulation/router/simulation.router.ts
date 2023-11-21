// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import simulationController from '../api/simulation.controller';
import simulationValidator from '../validator/simulation.validator';

// region POST //
router.post(
  '/run',
  simulationValidator.runValidation(),
  simulationValidator.handleValidationErrors,
  simulationController.run,
);
// endregion POST //

// region GET //
router.get(
  '/:id/poll',
  simulationValidator.idValidation(),
  simulationValidator.handleValidationErrors,
  simulationController.poll,
);
router.get(
  '/:id/conversations',
  simulationValidator.idValidation(),
  simulationValidator.handleValidationErrors,
  simulationController.getConversations,
);
router.get('/all', simulationController.getAll);
// region GET //

// region PATCH //
router.patch(
  '/:id',
  simulationValidator.runValidation(),
  simulationValidator.idValidation(),
  simulationValidator.handleValidationErrors,
  simulationController.update,
);
// endregion PATCH //

// region DELETE //
router.delete(
  '/:id',
  simulationValidator.idValidation(),
  simulationValidator.handleValidationErrors,
  simulationController.del,
);
// endregion DELETE //

export default router;
