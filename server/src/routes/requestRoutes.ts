import { Router } from 'express';
import { RequestController } from '../controllers/requestController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

// Root request route - route by role
router.get('/', (req, res) => {
  if ((req as any).user?.role === 'hospital' || (req as any).user?.role === 'admin') {
    return RequestController.getHospitalRequests(req, res);
  }
  return RequestController.getPatientRequests(req, res);
});

// Patient request creation & list
router.post('/', requireRole('patient'), RequestController.createRequest);
router.get('/patient', requireRole('patient'), RequestController.getPatientRequests);
router.get('/my', requireRole('patient'), RequestController.getPatientRequests);

// Hospital request review
router.get('/hospital', requireRole('hospital', 'admin'), RequestController.getHospitalRequests);

// Request details & status update
router.get('/:id', RequestController.getById);
router.patch('/:id/status', requireRole('hospital', 'admin'), RequestController.updateStatus);

export default router;
