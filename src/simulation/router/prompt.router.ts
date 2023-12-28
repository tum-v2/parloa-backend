import express from 'express';

import promptController from '@simulation/api/prompt.controller';
import { verifyToken } from '@utils/auth-token';

const router = express.Router();

router.get('/', verifyToken, promptController.getPrompts);

export default router;
