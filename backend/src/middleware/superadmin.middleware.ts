import type { Request, Response, NextFunction } from 'express';
import { ERR } from '../utils/errorMessages.js';
import { HttpStatus } from '../utils/httpStatusCodes.js';

export const isSuperadmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            error: "Unauthorized",
            message: ERR.AUTH.UNAUTHORIZED
        });
    }

    if (req.user.isSuperadmin !== true) {
        return res.status(HttpStatus.FORBIDDEN).json({
            error: "Forbidden",
            message: ERR.AUTH.FORBIDDEN_SUPERADMIN
        });
    }

    next();
};