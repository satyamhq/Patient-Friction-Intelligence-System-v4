import { Router } from 'express';
import { GovernmentController } from '../controllers/governmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/profile/me', authenticate, requireRole('government'), GovernmentController.getMyProfile);
router.get('/analytics', authenticate, requireRole('government'), GovernmentController.getDashboardAnalytics);
router.get('/hospitals', authenticate, requireRole('government'), GovernmentController.getAllHospitals);
router.put('/hospitals/:id/approve', authenticate, requireRole('government'), GovernmentController.approveHospital);
router.put('/hospitals/:id/reject', authenticate, requireRole('government'), GovernmentController.rejectHospital);

export default router;
