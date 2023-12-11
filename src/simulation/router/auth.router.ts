import express from 'express';

import authController from '@simulation/api/auth.controller';

const router = express.Router();

// POST //
router.post('/login', authController.login);

export default router;
