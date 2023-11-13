// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import simulationController from '../api/simulation.controller';

/**
 * @swagger
 * tags:
 *   - name: Simulation
 * definitions:
 *   Agent:
 *     type: object
 *     required:
 *       - model
 *       - temperature
 *       - maxTokens
 *       - prompt
 *     properties:
 *       model:
 *         type: string
 *         example: GPT-3
 *       temperature:
 *         type: number
 *         example: 1
 *       maxTokens:
 *         type: number
 *         example: 2048
 *       prompt:
 *         type: string
 *         example: ''
 * /run:
 *   post:
 *     summary: Start a new simulation
 *     description: Endpoint to start a new simulation.
 *     tags: [Simulation]
 *     parameters:
 *       - in: body
 *         name: simulation
 *         description: Simulation configuration
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - user
 *             - scenario
 *             - type
 *             - domain
 *             - numConversations
 *             - serviceAgentConfig
 *             - userAgentConfig
 *           properties:
 *             user:
 *               type: number
 *             name:
 *               type: string
 *             scenario:
 *               type: string
 *               enum: [SEQUENCE, SLOT_FILLING, CALL_FORWARD]
 *             type:
 *               type: string
 *               enum: [MANUAL, AUTOMATED]
 *             domain:
 *               type: string
 *               enum: [FLIGHT, INSURANCE]
 *             numConversations:
 *               type: number
 *             serviceAgentConfig:
 *               type: object
 *               schema:
 *                 $ref: '#/definitions/Agent'
 *             userAgentConfig:
 *               type: object
 *               schema:
 *                 $ref: '#/definitions/Agent'
 *     responses:
 *       201:
 *         description: Simulation successfully created
 *       400:
 *         description: Bad request - Invalid input provided
 *
 * /{simulationId}/poll:
 *   get:
 *     summary: Retrieve simulation
 *     description: Endpoint to retrieving a simulation.
 *     tags: [Simulation]
 *     parameters:
 *       - in: path
 *         name: simulationId
 *         description: Simulation ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           properties:
 *             user:
 *               type: number
 *               example: 1
 *             scenario:
 *               type: string
 *               enum: [SEQUENCE, SLOT_FILLING, CALL_FORWARD]
 *             type:
 *               type: string
 *               enum: [MANUAL, AUTOMATED]
 *             domain:
 *               type: string
 *               enum: [FLIGHT, INSURANCE]
 *             agents:
 *               type: array
 *               example: []
 *             conversations:
 *               type: array
 *               example: []
 *             status:
 *               type: string
 *               enum: [STARTED, FINISHED]
 *       404:
 *         description: Simulation not found
 *
 * /{simulationId}/details:
 *   get:
 *     summary: Retrieve simulation details
 *     description: Endpoint to retrieving simulation details.
 *     tags: [Simulation]
 *     parameters:
 *       - in: path
 *         name: simulationId
 *         description: Simulation ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           properties:
 *             timeToRun:
 *               type: string
 *               example: 00:10
 *             numOfInteractions:
 *               type: number
 *               example: 100
 *             numOfRuns:
 *               type: number
 *               example: 10
 *             successRate:
 *               type: number
 *               example: 0.75
 *       404:
 *         description: Simulation not found
 *
 * /{simulationId}/conversation:
 *   get:
 *     summary: Retrieve simulation conversations
 *     description: Endpoint to retrieving simulation conversations.
 *     tags: [Simulation]
 *     parameters:
 *       - in: path
 *         name: simulationId
 *         description: Simulation ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 example: []
 *               start:
 *                 type: string
 *                 format: date
 *                 example: 2023-12-12
 *               status:
 *                 type: string
 *                 enum: [STARTED, FINISHED]
 *               usedEndpoints:
 *                 type: array
 *                 example: []
 *       404:
 *         description: Simulation not found
 */

router.post('/run', simulationController.run);
router.get('/:id/poll', simulationController.poll);
router.get('/:id/details', simulationController.getDetails);
router.get('/:id/conversations', simulationController.getConversations);

export default router;
