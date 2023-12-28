import { GoalDocument } from '@db/models/goal.model';
import RepositoryFactory from '@db/repositories/factory';

const goalRepository = RepositoryFactory.goalRepository;

/**
 * Create a goal
 * @param goal - Goal object
 * @returns A promise that resolves to the created goal object.
 * @throws Error if the goal could not be created.
 */
async function create(goal: Partial<GoalDocument>): Promise<GoalDocument> {
  return await goalRepository.create(goal);
}

/**
 * Get all goals
 * @returns A promise that resolves to an array of goal objects.
 */
async function getAll(): Promise<GoalDocument[]> {
  return await goalRepository.findAll();
}

/**
 * Get a goal by id
 * @param id - Goal id
 * @returns A promise that resolves to the goal object.
 * @throws Error if the goal could not be found.
 */
async function getById(id: string): Promise<GoalDocument | null> {
  return await goalRepository.getById(id);
}

/**
 * Update a goal
 * @param id - Goal id
 * @param goal - Goal object
 * @returns A promise that resolves to the updated goal object.
 * @throws Error if the goal could not be updated.
 */
async function update(id: string, goal: Partial<GoalDocument>): Promise<GoalDocument | null> {
  return await goalRepository.updateById(id, goal);
}

/**
 * Delete a goal
 * @param id - Goal id
 * @returns A promise that resolves to the deleted goal object.
 * @throws Error if the goal could not be deleted.
 */
async function del(id: string): Promise<boolean> {
  return await goalRepository.deleteById(id);
}

export default {
  create,
  getAll,
  getById,
  update,
  del,
};
