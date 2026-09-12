import { Router } from 'express';
import { HospitalController } from '../controllers/hospitalController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Hospital Protected (Must be placed before /:id parameter)
router.get('/profile/me', authenticate, requireRole('hospital', 'admin'), HospitalController.getMyProfile);
router.put('/profile/me', authenticate, requireRole('hospital', 'admin'), HospitalController.updateProfile);
router.post('/departments', authenticate, requireRole('hospital', 'admin'), HospitalController.addDepartment);
router.put('/departments/:deptId', authenticate, requireRole('hospital', 'admin'), HospitalController.updateDepartment);
router.delete('/departments/:deptId', authenticate, requireRole('hospital', 'admin'), HospitalController.deleteDepartment);

// Public endpoints (or patient hospital finder)
router.get('/nearby', HospitalController.getNearby);
router.get('/search', HospitalController.search);
router.get('/:id', HospitalController.getById);

export default router;
