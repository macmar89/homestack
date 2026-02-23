import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { honeypot } from '../middleware/honeypot.middleware.js';

const router = Router();

router.post('/register', honeypot('middle_name'), authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

export default router;