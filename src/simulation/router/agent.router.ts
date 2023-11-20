import express, { Router } from 'express';
import agentControler from '../api/agent.controller';

const router: Router = express.Router();

router.post('/', agentControler.createAgent);
router.get('/:id', agentControler.getAgent);
router.put('/:id', agentControler.updateAgent);
router.delete('/:id', agentControler.deleteAgent);

export default router;
