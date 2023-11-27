// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import optimizationController from '../api/optimization.controller';

// region POST //
router.post(
  '/run',
  optimizationController.run,
);
// endregion POST //
export default router;
