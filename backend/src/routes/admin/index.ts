import { Router } from 'express';
import adminOrganizationRoutes from './organization.routes.js';

const router = Router();

router.use('/organization', adminOrganizationRoutes);

export default router;