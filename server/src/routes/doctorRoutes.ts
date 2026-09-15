import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();
const auth = [authenticate, requireRole('doctor')];

// ── Profile ──────────────────────────────────────────────────────────────────
router.get('/profile/me', ...auth, DoctorController.getMyProfile);
router.put('/profile/me', ...auth, DoctorController.updateMyProfile);

// ── Dashboard & Alerts ────────────────────────────────────────────────────────
router.get('/dashboard', ...auth, DoctorController.getDashboardStats);
router.get('/clinical-alerts', ...auth, DoctorController.getClinicalAlerts);

// ── Patients ──────────────────────────────────────────────────────────────────
router.get('/patients', ...auth, DoctorController.getMyPatients);

// ── Consultation ──────────────────────────────────────────────────────────────
router.post('/consultation', ...auth, DoctorController.recordConsultation);

// ── OPD Queue ─────────────────────────────────────────────────────────────────
router.get('/queue', ...auth, DoctorController.getDoctorQueue);
router.post('/queue/call-next', ...auth, DoctorController.callNextInQueue);
router.post('/queue/call/:id', ...auth, DoctorController.callSpecificToken);
router.put('/queue/skip/:id', ...auth, DoctorController.skipToken);
router.put('/queue/no-show/:id', ...auth, DoctorController.markNoShow);
router.put('/queue/complete/:id', ...auth, DoctorController.completeQueueToken);

// ── Prescriptions ─────────────────────────────────────────────────────────────
router.get('/prescriptions', ...auth, DoctorController.getPrescriptions);
router.post('/prescriptions', ...auth, DoctorController.createPrescription);
router.put('/prescriptions/:id/status', ...auth, DoctorController.updatePrescriptionStatus);

// ── Lab Orders ────────────────────────────────────────────────────────────────
router.get('/lab-orders', ...auth, DoctorController.getLabOrders);
router.post('/lab-orders', ...auth, DoctorController.createLabOrder);
router.put('/lab-orders/:id/review', ...auth, DoctorController.reviewLabOrder);

// ── Referrals ─────────────────────────────────────────────────────────────────
router.get('/referrals', ...auth, DoctorController.getDoctorReferrals);
router.post('/referrals', ...auth, DoctorController.createDoctorReferral);

// ── Follow-ups ────────────────────────────────────────────────────────────────
router.get('/follow-ups', ...auth, DoctorController.getFollowUps);
router.post('/follow-ups', ...auth, DoctorController.createFollowUp);
router.put('/follow-ups/:id', ...auth, DoctorController.updateFollowUpStatus);

// ── Schedule ──────────────────────────────────────────────────────────────────
router.get('/schedule', ...auth, DoctorController.getSchedule);
router.put('/schedule', ...auth, DoctorController.updateSchedule);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', ...auth, DoctorController.getDoctorNotifications);

export default router;
