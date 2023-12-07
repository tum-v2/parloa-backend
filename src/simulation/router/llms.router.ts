// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import llmController from '@simulation/api/llms.controller';

router.get('/models', llmController.getLLMs);

export default router;
