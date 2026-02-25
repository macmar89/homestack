import { Router } from 'express';
import * as adminOrganizationsController from '../../controllers/admin/organization.controller.js';
import { isAuth } from '../../middleware/auth.middleware.js';
import { isSuperadmin } from '../../middleware/superadmin.middleware.js';

const router = Router();

router.post('/', isAuth, isSuperadmin, adminOrganizationsController.registerNewOrganizationOwner);

export default router;