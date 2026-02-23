import { z } from 'zod';
import { AuthErrors } from './constants/errors/auth.errors.js';

export const RegisterSchema = z.object({
    email: z.email(AuthErrors.VALIDATION.INVALID_EMAIL),
    password: z.string().min(8, AuthErrors.VALIDATION.PASSWORD_TOO_SHORT),
    name: z.string().min(2, AuthErrors.VALIDATION.NAME_TOO_SHORT),
    householdName: z.string().min(2, AuthErrors.VALIDATION.HOUSEHOLD_NAME_TOO_SHORT),
});

export const LoginSchema = z.object({
    email: z.email(AuthErrors.VALIDATION.INVALID_EMAIL),
    password: z.string().min(8, AuthErrors.VALIDATION.PASSWORD_TOO_SHORT),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;