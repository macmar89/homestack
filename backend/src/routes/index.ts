import { Router } from 'express';
import authRoutes from './auth.routes.js';
import { AppError } from '../utils/appError.js';
import { HttpStatus } from '../utils/httpStatusCodes.js';

const router = Router();

router.use('/auth', authRoutes);

router.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, HttpStatus.NOT_FOUND));
});

export default router;