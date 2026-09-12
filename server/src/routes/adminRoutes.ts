import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', AdminController.getDashboardStats);
router.get('/friction-map', AdminController.getPopulationFrictionMap);
router.get('/care-leakage', AdminController.getCareLeakage);
router.get('/care-failure', AdminController.getWhyCareFailed);
router.get('/patients', AdminController.getAllPatients);
router.get('/hospitals', AdminController.getAllHospitals);
router.post('/hospitals', AdminController.createHospital);
router.put('/hospitals/:id', AdminController.updateHospital);
router.delete('/hospitals/:id', AdminController.deleteHospital);
router.get('/audit-logs', AdminController.getAuditLogs);
// Feature Flags
router.get('/feature-flags', AdminController.getFeatureFlags);
router.put('/feature-flags/:key', AdminController.updateFeatureFlag);
// User Management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:id/toggle', AdminController.toggleUserStatus);

export default router;
