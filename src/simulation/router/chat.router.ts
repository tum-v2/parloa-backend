// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import chatController from '../api/chat.controller';

router.post('/start', chatController.start);
router.get('/all', chatController.getAll);
router.post('/:id/send-message', chatController.sendMessage);
router.get('/:id', chatController.get);
router.get('/:id/end', chatController.end);
router.put('/:id', chatController.update);
router.delete('/:id', chatController.del);

export default router;
