import { Router } from 'express';
import { QueueController } from '../controllers/queueController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/live', authenticate, QueueController.getLiveQueue);
router.post('/issue', authenticate, QueueController.issueToken);
router.post('/call-next', authenticate, QueueController.callNext);
router.put('/:id/complete', authenticate, QueueController.completeToken);

export default router;
