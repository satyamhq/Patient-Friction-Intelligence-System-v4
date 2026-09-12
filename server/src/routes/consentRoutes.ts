import { Router } from 'express';
import { ConsentController } from '../controllers/consentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/my', authenticate, ConsentController.getMyConsents);
router.post('/grant', authenticate, ConsentController.grantConsent);
router.put('/:id/revoke', authenticate, ConsentController.revokeConsent);

export default router;
