import { Router } from 'express';
import { GovernmentController } from '../controllers/governmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Allow government officers and admin evaluators
router.use(authenticate, requireRole('government', 'admin'));

// 1. Profile & Dashboard
router.get('/profile/me', GovernmentController.getMyProfile);
router.get('/analytics', GovernmentController.getDashboardAnalytics);
router.get('/dashboard', GovernmentController.getDashboardAnalytics);

// 2. Action Center
router.get('/actions', GovernmentController.getActionCenterTickets);
router.put('/actions/:id', GovernmentController.updateActionTicket);

// 3. Hospital Registry & Verification
router.get('/hospitals', GovernmentController.getAllHospitals);
router.put('/hospitals/:id/verify', GovernmentController.verifyHospital);
router.put('/hospitals/:id/approve', (req, res) => {
  req.body.action = 'APPROVE';
  GovernmentController.verifyHospital(req, res);
});
router.put('/hospitals/:id/reject', (req, res) => {
  req.body.action = 'REJECT';
  GovernmentController.verifyHospital(req, res);
});

// 4. Operational Oversight Modules
router.get('/beds', GovernmentController.getHospitalBeds);
router.get('/referrals', GovernmentController.getReferralNetwork);
router.get('/friction-trends', GovernmentController.getFrictionTrends);
router.get('/asha-coverage', GovernmentController.getAshaCoverage);
router.get('/facility-quality', GovernmentController.getFacilityQuality);
router.get('/services', GovernmentController.getServiceAvailability);
router.get('/opd-analytics', GovernmentController.getOPDAnalytics);
router.get('/labs', GovernmentController.getLabNetwork);
router.get('/pharmacy', GovernmentController.getPharmacyAvailability);
router.get('/district-comparison', GovernmentController.getDistrictComparison);
router.get('/reports', GovernmentController.getReports);
router.get('/audit-logs', GovernmentController.getAuditLogs);

export default router;
