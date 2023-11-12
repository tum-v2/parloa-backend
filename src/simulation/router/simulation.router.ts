// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import simulationController from '../api/simulation.controller';

router.post('/run', simulationController.runSimulation);
router.get('/:id/poll', simulationController.pollSimulation);
router.get('/:id/details', simulationController.getSimulationDetails);

export default router;
