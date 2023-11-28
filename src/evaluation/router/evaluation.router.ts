// Router that routes incoming requests to relevant controller function
import express from 'express';
const router = express.Router();

import evaluationController from '../api/evaluation.controller';

// region POST //
router.post('/run', evaluationController.run);
// endregion POST //

// region GET //
// router.get();
