// src/middleware/error.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
    });

    if (err.name === 'ZodError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation failed',
            errors: err.errors.map((e: any) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message,
    });
};