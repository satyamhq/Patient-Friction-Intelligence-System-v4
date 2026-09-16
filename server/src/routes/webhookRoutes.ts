import { Router } from 'express';
import { handleHelplineCallWebhook } from '../controllers/appointmentVoiceController.js';

const router = Router();

// POST /api/webhooks/helpline - Helpline call status and transcript webhook
router.post('/helpline', handleHelplineCallWebhook);

export default router;
