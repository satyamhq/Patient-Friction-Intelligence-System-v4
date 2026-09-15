import { Router } from 'express';
import {
  handleChatQuery,
  getSuggestedQuestions,
  getAiStatus,
  triggerReindexing,
} from '../controllers/aiController.js';

const router = Router();

// POST /api/ai/chat - Ask questions with RAG & Gemini
router.post('/chat', handleChatQuery);

// GET /api/ai/suggestions - Retrieve suggested questions categorized by role
router.get('/suggestions', getSuggestedQuestions);

// GET /api/ai/status - Check RAG status, active model, and total indexed items
router.get('/status', getAiStatus);

// POST /api/ai/reindex - Trigger hot re-indexing of the codebase
router.post('/reindex', triggerReindexing);

export default router;
