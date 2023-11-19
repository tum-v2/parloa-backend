// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import simulationController from '../api/simulation.controller';

// region POST //
router.post('/run', simulationController.run);
// endregion POST //

// region GET //
router.get('/:id/poll', simulationController.poll);
router.get('/:id/details', simulationController.getDetails);
router.get('/:id/conversations', simulationController.getConversations);
router.get('/all', simulationController.getAll);
// region GET //

// region PATCH //
router.patch('/:id', simulationController.update);
// endregion PATCH //

// region DELETE //
router.delete('/:id', simulationController.del);
// endregion DELETE //

export default router;
