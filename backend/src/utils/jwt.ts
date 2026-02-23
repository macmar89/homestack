import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

export const generateAccessToken = (payload: object): string => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || '15m',
    });
};

export const generateRefreshToken = (): string => {
    return randomBytes(40).toString('hex');
};