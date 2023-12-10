import express from 'express';

import dashboardController from '@simulation/api/dashboard.controller';

const router = express.Router();

// region GET //
router.get('/', dashboardController.getDashboardData);
// endregion GET //

export default router;
