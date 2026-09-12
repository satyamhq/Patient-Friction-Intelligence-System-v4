import { Router } from 'express';
import { AshaController } from '../controllers/ashaController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/profile/me', authenticate, requireRole('asha_worker'), AshaController.getMyProfile);
router.put('/profile/me', authenticate, requireRole('asha_worker'), AshaController.updateMyProfile);
router.get('/patients', authenticate, requireRole('asha_worker'), AshaController.getAssignedPatients);
router.get('/dashboard', authenticate, requireRole('asha_worker'), AshaController.getDashboardStats);
router.post('/flag-patient', authenticate, requireRole('asha_worker'), AshaController.flagPatient);

export default router;
