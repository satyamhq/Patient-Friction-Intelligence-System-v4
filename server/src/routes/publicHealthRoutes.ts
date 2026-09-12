import { Router } from 'express';
import { PublicHealthController } from '../controllers/publicHealthController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// 1. Digital Triage (legacy — kept for backward compatibility)
router.post('/triage', PublicHealthController.runTriage);
router.get('/triage/patient/:patientId?', authenticate, PublicHealthController.getPatientTriage);

// 1b. NON-CLINICAL Healthcare Access & Facility Router
// Routes patients to real facilities using logistics factors only (service, distance, accessibility)
// Authentication required — patient identity used for persistence/audit
router.post('/triage/access-route', authenticate, PublicHealthController.runAccessRoute);

// 2. Referrals — all require authentication; patient scope enforced server-side
router.get('/referrals', authenticate, PublicHealthController.getReferrals);
router.post('/referrals', authenticate, PublicHealthController.createReferral);
router.get('/referrals/:id', authenticate, PublicHealthController.getReferralById);
router.get('/referrals/:id/events', authenticate, PublicHealthController.getReferralEvents);
router.patch('/referrals/:id/status', authenticate, PublicHealthController.updateReferralStatus);

// 3. Longitudinal Health Records & ABHA
router.get('/records', authenticate, PublicHealthController.getHealthRecords);
router.get('/records/export-fhir', authenticate, PublicHealthController.exportFhirJson);
router.get('/records/consents', authenticate, PublicHealthController.getConsents);
router.patch('/records/consents/:id', authenticate, PublicHealthController.toggleConsent);
router.get('/records/audit-events', authenticate, PublicHealthController.getHealthRecordAuditEvents);
router.post('/records/abha/connect', authenticate, PublicHealthController.connectAbha);
router.post('/records/abha/disconnect', authenticate, PublicHealthController.disconnectAbha);
router.get('/records/:patientId', authenticate, PublicHealthController.getHealthRecords);
router.post('/records', authenticate, PublicHealthController.createHealthRecord);

// 4. Diagnostics & Equipment Status
router.get('/diagnostics', PublicHealthController.getDiagnostics);
router.get('/diagnostics/bookings', authenticate, PublicHealthController.getDiagnosticBookings);
router.get('/diagnostics/:id', PublicHealthController.getDiagnosticById);
router.post('/diagnostics/book', authenticate, PublicHealthController.bookDiagnostic);
router.patch('/diagnostics/:id/status', authenticate, PublicHealthController.updateDiagnosticStatus);
router.patch('/diagnostics/bookings/:id/cancel', authenticate, PublicHealthController.cancelDiagnosticBooking);

// 5. Essential Medicines (Verified Facility Inventory)
router.get('/medicines', PublicHealthController.getMedicines);
router.get('/medicines/audit-events', authenticate, PublicHealthController.getMedicineAuditEvents);
router.get('/medicines/:id', PublicHealthController.getMedicineById);
router.patch('/medicines/:id/stock', authenticate, PublicHealthController.updateMedicineStock);

// 6. High-Risk Registry (Maternal, Child, NCD) — all routes require authentication; RBAC enforced in controller
router.get('/high-risk', authenticate, PublicHealthController.getHighRiskRegistry);
router.post('/high-risk', authenticate, PublicHealthController.createHighRiskEntry);
router.patch('/high-risk/:id/status', authenticate, PublicHealthController.updateHighRiskStatus);
router.get('/high-risk/audit-events', authenticate, PublicHealthController.getHighRiskAuditEvents);

// 7. Frontline Operational Desk (ASHA / ANM / CHO) — all routes require authentication; RBAC enforced in controller
router.get('/frontline/metrics', authenticate, PublicHealthController.getFrontlineMetrics);
router.get('/frontline/visits', authenticate, PublicHealthController.getFrontlineVisits);
router.post('/frontline/visits', authenticate, PublicHealthController.createFrontlineVisit);
router.post('/frontline/visits/:id/start', authenticate, PublicHealthController.startFrontlineVisit);
router.post('/frontline/visits/:id/complete', authenticate, PublicHealthController.completeFrontlineVisit);
router.get('/frontline/tasks', authenticate, PublicHealthController.getFrontlineTasks);
router.post('/frontline/tasks', authenticate, PublicHealthController.createFrontlineTask);
router.patch('/frontline/tasks/:id/status', authenticate, PublicHealthController.updateFrontlineTaskStatus);
router.post('/frontline/sync', authenticate, PublicHealthController.processOfflineSync);
router.get('/frontline/audit-events', authenticate, PublicHealthController.getFrontlineAuditEvents);

// 7b. Citizen Doorstep Care Requests (Patient Doorstep Support)
router.post('/frontline/doorstep-requests', authenticate, PublicHealthController.createDoorstepRequest);
router.get('/frontline/doorstep-requests', authenticate, PublicHealthController.getDoorstepRequests);

// 8. Emergency 108 SOS Dispatch
router.post('/emergency/sos', PublicHealthController.triggerEmergencySOS);

// 9. Facility Quality & NQAS Metrics
router.get('/facilities/:id/metrics', PublicHealthController.getFacilityMetrics);

export default router;
