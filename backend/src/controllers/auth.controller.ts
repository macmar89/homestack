import { catchAsync } from "../utils/catchAsync.js";
import { type Request, type Response } from "express";
import { AppError } from "../utils/appError.js";
import { rotateRefreshToken } from "../services/auth.service.js";

export const refresh = catchAsync(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refresh_token;

    if (!oldRefreshToken) {
        throw new AppError('Missing refresh token', 401);
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
        path: '/api/auth/refresh',
        maxAge: Number(process.env.COOKIE_REFRESH_MAX_AGE),
    });

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});