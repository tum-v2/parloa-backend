import express from 'express';

import dashboardController from '@simulation/api/dashboard.controller';
import { verifyToken } from '@utils/auth-token';

const router = express.Router();

router.get('/', verifyToken, dashboardController.getDashboardData);

export default router;
