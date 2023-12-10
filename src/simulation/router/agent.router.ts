import express, { Router } from 'express';

import agentController from '@simulation/api/agent.controller';
import { CustomValidationError } from '@utils/handle-validation-errors';
import AgentValidator from '@simulation/validator/agent.validator';

const router: Router = express.Router();

// region POST //
router.post('/', AgentValidator.runValidation(), CustomValidationError.handleValidationErrors, agentController.create);
// endregion POST //

// region GET //
router.get('/all', agentController.getAll);
router.get('/:id', AgentValidator.idValidation(), CustomValidationError.handleValidationErrors, agentController.get);
// region GET //

// region PUT //
router.put(
  '/:id',
  // AgentValidator.idValidation(),
  // AgentValidator.runValidation(),
  // CustomValidationError.handleValidationErrors,
  agentController.update,
);
// endregion PUT //

// region DELETE //
router.delete('/:id', AgentValidator.idValidation(), CustomValidationError.handleValidationErrors, agentController.del);
// endregion DELETE //

export default router;
