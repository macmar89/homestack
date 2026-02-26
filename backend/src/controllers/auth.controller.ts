import { catchAsync } from "../utils/catchAsync.js";
import { type Request, type Response } from "express";
import { AppError } from "../utils/appError.js";
import { createSession, logoutUser, loginUser, rotateRefreshToken, getUserProfile } from "../services/auth.service.js";
import { AuthErrors } from "../shared/constants/errors/auth.errors.js";
import { LoginSchema } from "../shared/constants/schema/auth.schema.js";
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_CLEAR_OPTIONS, CLEAR_COOKIE_OPTIONS } from "../utils/cookie.util.js";
import { HttpStatus } from "../utils/httpStatusCodes.js";
import { generateAccessToken } from "../utils/jwt.js";
import { AuthMessages } from "../shared/constants/messages/auth.messages.js";
import { logActivity } from "../services/audit.service.js";

export const login = catchAsync(async (req: Request, res: Response) => {
    const validatedData = LoginSchema.parse(req.body);

    const { user, orgs } = await loginUser(validatedData, req);

    const userAgent = req.headers['user-agent'] || 'unknown';
    const refreshToken = await createSession(user.id, userAgent);

    if (!refreshToken) {
        throw new AppError(AuthErrors.SESSION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const accessToken = generateAccessToken({
        id: user.id,
        isSuperadmin: user.isSuperadmin
    });

    res.cookie('access_token', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.cookie('refresh_token', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    await logActivity(
        req,
        "LOGIN_SUCCESS",
        { type: "auth", id: user.id },
        { method: "password" },
        { userId: user.id }
    );

    res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                isSuperadmin: user.isSuperadmin
            },
            orgs
        }
    });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refresh_token;

    if (!oldRefreshToken) {
        throw new AppError(AuthErrors.MISSING_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const { accessToken, newRefreshToken, user } = await rotateRefreshToken(oldRefreshToken);

    res.cookie('access_token', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.cookie('refresh_token', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
        const userId = await logoutUser(refreshToken);

        if (userId) {
            await logActivity(
                req,
                "LOGOUT",
                { type: "auth", id: userId },
                null,
                { userId }
            );
        }
    }

    res.clearCookie('access_token', CLEAR_COOKIE_OPTIONS);

    res.clearCookie('refresh_token', REFRESH_TOKEN_CLEAR_OPTIONS);

    res.status(HttpStatus.OK).json({
        status: 'success',
        message: AuthMessages.LOGOUT_SUCCESS
    });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
    const { user, orgs } = await getUserProfile(req.user!.id);

    res.status(HttpStatus.OK).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                isSuperadmin: user.isSuperadmin
            },
            orgs
        }
    });
})