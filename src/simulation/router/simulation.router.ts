// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import simulationController from '../api/simulation.controller';

router.post('/run', simulationController.run);
router.get('/:id/poll', simulationController.poll);
router.get('/:id/details', simulationController.getDetails);
router.get('/:id/conversations', simulationController.getConversations);

export default router;
