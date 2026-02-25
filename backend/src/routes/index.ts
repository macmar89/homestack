import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin/index.js';
import { isAuth } from '../middleware/auth.middleware.js';
import { isSuperadmin } from '../middleware/superadmin.middleware.js';

const router = Router();

router.use('/auth', authRoutes);

router.use('/admin', isAuth, isSuperadmin, adminRoutes);

export default router;