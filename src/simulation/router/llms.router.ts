import express from 'express';

import llmController from '@simulation/api/llms.controller';

const router = express.Router();

router.get('/models', llmController.getLLMs);

export default router;
