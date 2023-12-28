import express from 'express';

import promptController from '@simulation/api/prompt.controller';

const router = express.Router();

router.get('/', promptController.getPrompts);

export default router;
