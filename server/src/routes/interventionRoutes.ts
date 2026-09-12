import { Router } from 'express';
import { InterventionController } from '../controllers/interventionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', InterventionController.getInterventions);
router.post('/optimize', authenticate, InterventionController.optimize);

export default router;
