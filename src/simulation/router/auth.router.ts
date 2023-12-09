import express from 'express';

import authController from '@simulation/api/auth.controller';

const router = express.Router();

// region POST //
router.post('/login', authController.login);
// endregion POST //

export default router;
