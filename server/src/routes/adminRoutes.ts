import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Allow both admin and government officers to access read/analytics intelligence endpoints
router.use(authenticate, requireRole('admin', 'government'));

router.get('/dashboard', AdminController.getDashboardStats);
router.get('/friction-map', AdminController.getPopulationFrictionMap);
router.get('/care-leakage', AdminController.getCareLeakage);
router.get('/care-failure', AdminController.getWhyCareFailed);
router.get('/patients', AdminController.getAllPatients);
router.get('/hospitals', AdminController.getAllHospitals);

// Admin-only mutation endpoints
router.post('/hospitals', requireRole('admin'), AdminController.createHospital);
router.put('/hospitals/:id', requireRole('admin'), AdminController.updateHospital);
router.delete('/hospitals/:id', requireRole('admin'), AdminController.deleteHospital);

router.get('/audit-logs', AdminController.getAuditLogs);
// Feature Flags
router.get('/feature-flags', AdminController.getFeatureFlags);
router.put('/feature-flags/:key', requireRole('admin'), AdminController.updateFeatureFlag);
// User Management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:id/toggle', requireRole('admin'), AdminController.toggleUserStatus);
router.get('/state-command', AdminController.getStateCommand);
router.get('/simulator', AdminController.getPolicySimulator);
router.get('/budget-optimizer', AdminController.getBudgetOptimizer);
router.get('/integrations', AdminController.getSystemIntegrations);
router.get('/data-quality', AdminController.getDataQuality);
router.get('/permissions', AdminController.getPermissionsMatrix);
router.get('/system-health', AdminController.getSystemHealth);
router.get('/system-map', AdminController.getSystemMap);
router.get('/reports', AdminController.getAdminReports);

export default router;

