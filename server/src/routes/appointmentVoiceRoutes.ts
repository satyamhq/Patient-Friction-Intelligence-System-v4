import { Router } from 'express';
import {
  createAppointment,
  initiateAppointmentCall,
  getAppointmentById,
  updateAppointment,
  handleElevenLabsWebhook,
  logVoiceCall,
  recordVoiceFriction,
  getLatestVoiceAppointmentStatus,
  getVoiceContextDirectory,
} from '../controllers/appointmentVoiceController.js';

const router = Router();

// ============================================================
// Core Appointment APIs (MongoDB Collection: appointments)
// ============================================================

// POST /api/appointments - Book/register appointment
router.post('/', createAppointment);

// POST /api/appointments/call - Trigger outbound call relay
router.post('/call', initiateAppointmentCall);

// GET /api/appointments/:id - Retrieve appointment by ID
router.get('/:id', getAppointmentById);

// PATCH /api/appointments/:id - Update appointment
router.patch('/:id', updateAppointment);

// ============================================================
// ElevenLabs Webhook Endpoint
// ============================================================
// POST /api/appointments/webhook/elevenlabs
router.post('/webhook/elevenlabs', handleElevenLabsWebhook);

// ============================================================
// Voice Agent Integration Endpoints
// ============================================================
router.get('/voice-agent/context', getVoiceContextDirectory);
router.post('/voice-agent/book', createAppointment);
router.post('/voice-agent/call-log', logVoiceCall);
router.post('/voice-agent/friction', recordVoiceFriction);
router.get('/voice-agent/status', getLatestVoiceAppointmentStatus);
router.get('/voice-agent/status/:patientId', getLatestVoiceAppointmentStatus);

export default router;
