import { Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR } from '@utils/errors';
import goalService from '@simulation/service/goal.service';
import { GoalDocument } from '@db/models/goal.model';

async function createGoal(req: Request, res: Response): Promise<void> {
  try {
    const goal: Partial<GoalDocument> = req.body as Partial<GoalDocument>;
    const newGoal = await goalService.create(goal);
    res.status(201).send(newGoal);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

async function getAllGoals(req: Request, res: Response): Promise<void> {
  try {
    const goals: GoalDocument[] = await goalService.getAll();
    res.status(200).send(goals);
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

async function getGoalById(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const goal: GoalDocument | null = await goalService.getById(id);

    if (goal) {
      res.status(200).send(goal);
    } else {
      res.status(404).send({ error: `Goal ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

async function updateGoal(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const updates: Partial<GoalDocument> = req.body as Partial<GoalDocument>;
    const updatedGoal: GoalDocument | null = await goalService.update(id, updates);

    if (updatedGoal) {
      res.status(200).send(updatedGoal);
    } else {
      res.status(404).send({ error: `Goal ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

async function deleteGoal(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params.id;
    const deletedGoal: boolean = await goalService.del(id);

    if (deletedGoal) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: `Goal ${id} not found!` });
    }
  } catch (error) {
    res.status(500).json(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};
