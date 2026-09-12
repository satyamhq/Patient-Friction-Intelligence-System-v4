import { Router } from 'express';
import { LanguageController } from '../controllers/languageController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', LanguageController.getLanguages);
router.get('/:langCode/dialects', LanguageController.getDialects);
router.post('/preferences', authenticate, LanguageController.updateLanguagePreferences);
router.get('/analytics', authenticate, LanguageController.getLanguageAnalytics);

export default router;
