import express from 'express';

import dashboardController from '@simulation/api/dashboard.controller';

const router = express.Router();

router.get('/', dashboardController.getDashboardData);

export default router;
