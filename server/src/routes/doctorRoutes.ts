import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/profile/me', authenticate, requireRole('doctor'), DoctorController.getMyProfile);
router.put('/profile/me', authenticate, requireRole('doctor'), DoctorController.updateMyProfile);
router.get('/patients', authenticate, requireRole('doctor'), DoctorController.getMyPatients);
router.get('/dashboard', authenticate, requireRole('doctor'), DoctorController.getDashboardStats);
router.post('/consultation', authenticate, requireRole('doctor'), DoctorController.recordConsultation);
router.get('/clinical-alerts', authenticate, requireRole('doctor'), DoctorController.getClinicalAlerts);

export default router;
