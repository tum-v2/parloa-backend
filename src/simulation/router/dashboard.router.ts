// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import dashboardController from '@simulation/api/dashboard.controller';

router.get('/', dashboardController.getDashboardData);

export default router;
