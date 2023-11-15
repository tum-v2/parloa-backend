// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import chatController from '../api/chat.controller';

/**
 * @swagger
 * tags:
 *   - name: Chat
 *
 * /start:
 *   post:
 *     summary: Start a new chat
 *     description: Endpoint to start a new manual chat.
 *     tags: [Chat]
 *     parameters:
 *       - in: body
 *         name: config
 *         description: Chat configuration
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - model
 *             - temperature
 *             - maxTokens
 *             - prompt
 *           properties:
 *             model:
 *               type: string
 *             temperature:
 *               type: number
 *             maxTokens:
 *               type: number
 *             prompt:
 *               type: string
 *     responses:
 *       201:
 *         description: Chat started successfully
 *       400:
 *         description: Bad request - Invalid input provided
 * /send-message:
 *   post:
 *     summary: Start a new chat
 *     description: Endpoint to start a new manual chat.
 *     tags: [Chat]
 *     parameters:
 *       - in: body
 *         name: config
 *         description: Chat configuration
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - message
 *           properties:
 *             message:
 *               type: string
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Hello
 *       400:
 *         description: Bad request - Invalid input provided
 */
router.post('/start', chatController.startChat);
router.get('/send-message', chatController.sendMessage);
router.get('/end', chatController.endChat);

export default router;
