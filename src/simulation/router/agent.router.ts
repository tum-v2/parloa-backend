import express, { Router } from 'express';
import agentController from '@simulation/api/agent.controller';
import CustomValidationError from '@simulation/validator/error.validator';
import AgentValidator from '@simulation/validator/agent.validator';

const router: Router = express.Router();

// region POST //
router.post('/', AgentValidator.runValidation(), CustomValidationError.handleValidationErrors, agentController.create);
// endregion POST //

// region GET //
router.get('/all', agentController.getAll);
router.get('/:id', AgentValidator.idValidation(), CustomValidationError.handleValidationErrors, agentController.get);
// region GET //

// region PATCH //
router.put(
  '/:id',
  AgentValidator.idValidation(),
  AgentValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  agentController.update,
);
// endregion PATCH //

// region DELETE //
router.delete('/:id', AgentValidator.idValidation(), CustomValidationError.handleValidationErrors, agentController.del);
// endregion DELETE //

export default router;
