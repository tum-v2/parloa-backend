import express from 'express';

import llmController from '@simulation/api/llms.controller';
import { verifyToken } from '@utils/auth-token';

const router = express.Router();

router.get('/', verifyToken, llmController.getLLMs);

export default router;
