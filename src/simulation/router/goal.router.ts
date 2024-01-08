import { Router } from 'express';
import { CustomValidationError } from '@utils/handle-validation-errors';
import GoalValidator from '@simulation/validator/goal.validator';
import goalController from '@simulation/api/goal.controller';
import { verifyToken } from '@utils/auth-token';

const router = Router();

// POST //
router.post(
  '/',
  verifyToken,
  GoalValidator.createValidation(),
  CustomValidationError.handleValidationErrors,
  goalController.createGoal,
);

// GET //
router.get('/', verifyToken, goalController.getAllGoals);
router.get(
  '/:id',
  verifyToken,
  GoalValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  goalController.getGoalById,
);

// PUT //
router.put(
  '/:id',
  verifyToken,
  GoalValidator.idValidation(),
  GoalValidator.updateValidation(),
  CustomValidationError.handleValidationErrors,
  goalController.updateGoal,
);

// DELETE //
router.delete(
  '/:id',
  verifyToken,
  GoalValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  goalController.deleteGoal,
);

export default router;
