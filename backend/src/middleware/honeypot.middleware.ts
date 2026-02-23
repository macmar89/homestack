import { type Request, type Response, type NextFunction } from 'express';
import { HttpStatus } from '../utils/httpStatusCodes.js';
import { logger } from '../utils/logger.js';

export const honeypot = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.body[fieldName]) {
            logger.warn({
                event: 'honeypot_bot_detected',
                ip: req.ip,
                field: fieldName,
                userAgent: req.headers['user-agent']
            }, `[IMPORTANT] Bot detected in honeypot field "${fieldName}" from IP: ${req.ip}`);

            return res.status(HttpStatus.CREATED).json({ status: 'success' });
        }
        next();
    };
};