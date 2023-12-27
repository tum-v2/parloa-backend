import express, { Router } from 'express';

import agentController from '@simulation/api/agent.controller';
import { CustomValidationError } from '@utils/handle-validation-errors';
import AgentValidator from '@simulation/validator/agent.validator';
import { verifyToken } from '@utils/auth-token';

const router: Router = express.Router();

// POST //
router.post(
  '/',
  verifyToken,
  AgentValidator.runValidation(),
  CustomValidationError.handleValidationErrors,
  agentController.create,
);

// GET //
router.get('/', verifyToken, agentController.getAll);
router.get(
  '/:id',
  verifyToken,
  AgentValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  agentController.get,
);

// PUT //
router.put(
  '/:id',
  verifyToken,
  AgentValidator.idValidation(),
  AgentValidator.updateValidation(),
  CustomValidationError.handleValidationErrors,
  agentController.update,
);

// DELETE //
router.delete(
  '/:id',
  verifyToken,
  AgentValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  agentController.del,
);

export default router;
