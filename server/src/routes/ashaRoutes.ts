import { Router } from 'express';
import { AshaController } from '../controllers/ashaController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();
const authAsha = [authenticate, requireRole('asha_worker', 'admin')];

// 1. Profile
router.get('/profile/me', ...authAsha, AshaController.getMyProfile);
router.put('/profile/me', ...authAsha, AshaController.updateMyProfile);

// 2. Dashboard
router.get('/dashboard', ...authAsha, AshaController.getDashboardStats);

// 3. Patients
router.get('/patients', ...authAsha, AshaController.getAssignedPatients);

// 4. Households
router.get('/households', ...authAsha, AshaController.getHouseholds);
router.post('/households', ...authAsha, AshaController.createHousehold);

// 5. Field Visits
router.get('/visits', ...authAsha, AshaController.getVisits);
router.post('/visits', ...authAsha, AshaController.createVisit);
router.post('/visits/:id/start', ...authAsha, AshaController.startVisit);
router.post('/visits/:id/complete', ...authAsha, AshaController.completeVisit);

// 6. Follow-up Tasks & Reminders
router.get('/tasks', ...authAsha, AshaController.getTasks);
router.post('/tasks', ...authAsha, AshaController.createTask);
router.patch('/tasks/:id/status', ...authAsha, AshaController.updateTaskStatus);

// 7. Referral Tracking & Navigation
router.get('/referrals', ...authAsha, AshaController.getReferrals);
router.post('/referrals/:id/assist', ...authAsha, AshaController.assistReferral);

// 8. Appointment Assistance
router.get('/appointments', ...authAsha, AshaController.getAppointments);
router.post('/appointments', ...authAsha, AshaController.createAppointmentAssistance);

// 9. OPD Queue Token Assistance
router.get('/opd-tokens', ...authAsha, AshaController.getOPDTokens);
router.post('/opd-tokens', ...authAsha, AshaController.requestOPDToken);

// 10. Access Barriers & Friction Intelligence
router.get('/access-barriers', ...authAsha, AshaController.getAccessBarriers);
router.post('/access-barriers', ...authAsha, AshaController.recordAccessBarrier);

// 11. Escalations (Clinical Concern vs High Access Priority)
router.get('/escalations', ...authAsha, AshaController.getEscalations);
router.post('/escalations', ...authAsha, AshaController.createEscalation);

// 12. Offline Sync Engine
router.get('/sync/status', ...authAsha, AshaController.getSyncStatus);
router.post('/sync', ...authAsha, AshaController.processSync);

// 13. Audit Trail
router.get('/audit', ...authAsha, AshaController.getAuditTrail);

// 14. Notifications
router.get('/notifications', ...authAsha, AshaController.getNotifications);

// Legacy flag endpoint
router.post('/flag-patient', ...authAsha, AshaController.flagPatient);

export default router;
