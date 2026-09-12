import { Router } from 'express';
import { SimulationController } from '../controllers/simulationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/catalog', SimulationController.getCatalog);
router.post('/', authenticate, SimulationController.runSimulation);
router.post('/run', authenticate, SimulationController.runSimulation);
router.get('/saved', authenticate, SimulationController.getSavedSimulations);

export default router;
