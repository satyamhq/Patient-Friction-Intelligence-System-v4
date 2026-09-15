import { Router } from 'express';
import { handleElevenLabsWebhook } from '../controllers/appointmentVoiceController.js';

const router = Router();

// POST /api/webhooks/elevenlabs
router.post('/elevenlabs', handleElevenLabsWebhook);

export default router;
