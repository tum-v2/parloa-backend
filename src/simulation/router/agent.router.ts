import express, { Router } from 'express';
import agentControler from '../api/agent.controller';

const router: Router = express.Router();

router.post('/', agentControler.create);
router.get('/all', agentControler.getAll);
router.get('/:id', agentControler.get);
router.put('/:id', agentControler.update);
router.delete('/:id', agentControler.del);

export default router;
