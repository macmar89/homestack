import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

export interface JwtPayload {
    id: string;
    householdId: string;
}

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN!;

export const generateAccessToken = (payload: object): string => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: (ACCESS_TOKEN_EXPIRES_IN as any) || '15m',
    });
};

export const generateRefreshToken = (): string => {
    return randomBytes(40).toString('hex');
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
};