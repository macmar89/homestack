import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { isAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', isAuth, authController.getMe)
router.post('/refresh', authController.refresh);

export default router;