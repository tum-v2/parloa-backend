import express, { Router } from 'express';

import agentController from '@simulation/api/agent.controller';
import { CustomValidationError } from '@utils/handle-validation-errors';
import AgentValidator from '@simulation/validator/agent.validator';

const router: Router = express.Router();

// POST //
router.post(
  '/',
  AgentValidator.createValidation(),
  CustomValidationError.handleValidationErrors,
  agentController.create,
);

// GET //
router.get('/', agentController.getAll);
router.get('/:id', AgentValidator.idValidation(), CustomValidationError.handleValidationErrors, agentController.get);

// PUT //
router.put(
  '/:id',
  AgentValidator.idValidation(),
  AgentValidator.updateValidation(),
  CustomValidationError.handleValidationErrors,
  agentController.update,
);

// DELETE //
router.delete('/:id', AgentValidator.idValidation(), CustomValidationError.handleValidationErrors, agentController.del);

export default router;
