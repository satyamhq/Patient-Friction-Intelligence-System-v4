import { Router } from 'express';
import { DocumentController } from '../controllers/documentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('patient'), upload.single('file'), DocumentController.uploadDocument);
router.get('/', requireRole('patient'), DocumentController.getPatientDocuments);
router.get('/:id/file', DocumentController.getDocumentFile);
router.delete('/:id', requireRole('patient'), DocumentController.deleteDocument);

export default router;
