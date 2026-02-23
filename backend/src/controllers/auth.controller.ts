import { catchAsync } from "../utils/catchAsync.js";
import { type Request, type Response } from "express";
import { AppError } from "../utils/appError.js";
import { rotateRefreshToken, registerUser, createSession, loginUser, logoutUser } from "../services/auth.service.js";
import { AuthErrors } from "../shared/constants/errors/auth.errors.js";
import { AuthMessages } from "../shared/constants/messages/auth.messages.js";
import { RegisterSchema, LoginSchema } from "../shared/auth.schema.js";
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_CLEAR_OPTIONS, CLEAR_COOKIE_OPTIONS } from "../utils/cookie.util.js";
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

    res.cookie('access_token', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.cookie('refresh_token', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: { user: { id: user.id, name: user.name, email: user.email, householdName: validatedData.householdName } }
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const validatedData = LoginSchema.parse(req.body);

    const { user } = await loginUser(validatedData);

    const userAgent = req.headers['user-agent'] || 'unknown';
    const refreshToken = await createSession(user.id, userAgent);

    if (!refreshToken) {
        throw new AppError(AuthErrors.SESSION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const accessToken = generateAccessToken({
        id: user.id,
        householdId: user.householdId
    });

    res.cookie('access_token', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.cookie('refresh_token', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(HttpStatus.CREATED).json({
        status: 'success',
        data: { user: { id: user.id, name: user.name, email: user.email, householdName: user.householdName } }
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
        await logoutUser(refreshToken);
    }

    res.clearCookie('access_token', CLEAR_COOKIE_OPTIONS);

    res.clearCookie('refresh_token', REFRESH_TOKEN_CLEAR_OPTIONS);

    res.status(HttpStatus.OK).json({
        status: 'success',
        message: AuthMessages.LOGOUT_SUCCESS
    });
});