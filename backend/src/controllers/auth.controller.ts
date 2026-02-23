import { catchAsync } from "../utils/catchAsync.js";
import { type Request, type Response } from "express";
import { AppError } from "../utils/appError.js";
import { rotateRefreshToken, registerUser, createSession } from "../services/auth.service.js";
import { AuthErrors } from "../shared/constants/errors/auth.errors.js";
import { RegisterSchema } from "../shared/auth.schema.js";
import { HttpStatus } from "../utils/httpStatusCodes.js";
import { generateAccessToken } from "../utils/jwt.js";

export const register = catchAsync(async (req: Request, res: Response) => {
    const validatedData = RegisterSchema.parse(req.body);

    const { user } = await registerUser(validatedData);

    const userAgent = req.headers['user-agent'] || 'unknown';
    const refreshToken = await createSession(user.id, userAgent);

    if (!refreshToken) {
        throw new AppError(AuthErrors.SESSION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const accessToken = generateAccessToken({
        id: user.id,
        householdId: user.householdId
    });

    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: Number(process.env.COOKIE_ACCESS_MAX_AGE),
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
        maxAge: Number(process.env.COOKIE_REFRESH_MAX_AGE),
    });

    res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: { user: { id: user.id, name: user.name, email: user.email, householdName: validatedData.householdName } }
    });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refresh_token;

    if (!oldRefreshToken) {
        throw new AppError(AuthErrors.MISSING_REFRESH_TOKEN, 401);
    }

    const { accessToken, newRefreshToken, user } = await rotateRefreshToken(oldRefreshToken);

    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: Number(process.env.COOKIE_ACCESS_MAX_AGE),
    });

    res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
        maxAge: Number(process.env.COOKIE_REFRESH_MAX_AGE),
    });

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});