// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import chatController from '../api/chat.controller';

router.post('/start', chatController.startChat);
router.get('/send-message', chatController.sendMessage);
router.get('/end', chatController.endChat);

export default router;
