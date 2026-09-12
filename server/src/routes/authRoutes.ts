import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/google', AuthController.initiateGoogleOAuth);
router.post('/google', AuthController.googleLogin);
router.get('/google/config', AuthController.getGoogleConfig);
router.post('/google/config', AuthController.saveGoogleClientId);
router.get('/google/url', AuthController.getGoogleAuthUrl);
router.get('/google/callback', AuthController.handleGoogleCallbackGet);
router.post('/google/callback', AuthController.googleCallback);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', authenticate, AuthController.logout);

export default router;
