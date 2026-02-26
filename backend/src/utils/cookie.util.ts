import { type CookieOptions } from 'express';
import { IS_PRODUCTION } from '../config/env';

const BASE_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict',
};

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: Number(process.env.COOKIE_REFRESH_MAX_AGE),
};

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: Number(process.env.COOKIE_ACCESS_MAX_AGE),
};

export const CLEAR_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict',
};

export const REFRESH_TOKEN_CLEAR_OPTIONS: CookieOptions = {
    ...CLEAR_COOKIE_OPTIONS,
};
