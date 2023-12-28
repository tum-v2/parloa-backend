import { Router } from 'express';
import { CustomValidationError } from '@utils/handle-validation-errors';
import GoalValidator from '@simulation/validator/goal.validator';
import goalController from '@simulation/api/goal.controller';

const router = Router();

// POST //
router.post(
  '/',
  GoalValidator.createValidation(),
  CustomValidationError.handleValidationErrors,
  goalController.createGoal,
);

// GET //
router.get('/', goalController.getAllGoals);
router.get(
  '/:id',
  GoalValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  goalController.getGoalById,
);

// PUT //
router.put(
  '/:id',
  GoalValidator.idValidation(),
  GoalValidator.updateValidation(),
  CustomValidationError.handleValidationErrors,
  goalController.updateGoal,
);

// DELETE //
router.delete(
  '/:id',
  GoalValidator.idValidation(),
  CustomValidationError.handleValidationErrors,
  goalController.deleteGoal,
);

export default router;
