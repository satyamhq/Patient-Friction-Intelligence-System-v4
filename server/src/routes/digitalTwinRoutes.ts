import { Router } from 'express';
import { DigitalTwinController } from '../controllers/digitalTwinController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Interventions catalog is public or authenticated
router.get('/interventions', DigitalTwinController.getInterventions);

// Protected routes requiring authentication
router.use(authenticate);

router.get('/context', DigitalTwinController.getContext);
router.post('/simulate', DigitalTwinController.runSimulation);
router.post('/save', DigitalTwinController.saveSimulation);
router.get('/history', DigitalTwinController.getHistory);
router.get('/:id', DigitalTwinController.getById);
router.delete('/:id', DigitalTwinController.deleteById);

export default router;
