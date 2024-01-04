import express from 'express';

import dictionaryController from '@simulation/api/dictionary.controller';
import { verifyToken } from '@utils/auth-token';

const router = express.Router();

// GET LLM Models//
router.get('/language-models', verifyToken, dictionaryController.getLLMs);

// GET Prompts//
router.get('/prompts', verifyToken, dictionaryController.getPrompts);

// GET Domains//
router.get('/domains', verifyToken, dictionaryController.getDomains);

// GET Prompt Names//
router.get('/prompt-names', verifyToken, dictionaryController.getPromptNames);

export default router;
