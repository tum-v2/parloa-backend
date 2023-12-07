// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import authController from '@simulation/api/auth.controller';

router.post('/login', authController.login);

export default router;
