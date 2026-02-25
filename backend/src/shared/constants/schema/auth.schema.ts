import { z } from 'zod';
import { AuthErrors } from '../errors/auth.errors.js';

export const OwnerRegisterSchema = z.object({
    username: z.string().min(2, AuthErrors.VALIDATION.USERNAME_TOO_SHORT),
    displayName: z.string().nullable().or(z.literal("")),
    password: z.string().min(8, AuthErrors.VALIDATION.PASSWORD_TOO_SHORT),
    organizationName: z.string().min(2, AuthErrors.VALIDATION.ORGANIZATION_NAME_TOO_SHORT),
    organizationType: z.enum(["rental", "internal"]),
    slug: z.string().min(2, AuthErrors.VALIDATION.ORGANIZATION_SLUG_TOO_SHORT),
    email: z.email(AuthErrors.VALIDATION.INVALID_EMAIL),
    withTrial: z.boolean(),
    phoneNumber: z.string()
        .min(10, AuthErrors.VALIDATION.PHONE_NUMBER_TOO_SHORT)
        .max(15, AuthErrors.VALIDATION.PHONE_NUMBER_TOO_LONG)
        .trim()
        .regex(
            /^\+?[0-9\s]+$/,
            AuthErrors.VALIDATION.INVALID_PHONE_NUMBER
        )
        .transform((val) => val.replace(/\s+/g, '')),
});

export const RegisterSchema = z.object({
    username: z.string().min(2, AuthErrors.VALIDATION.USERNAME_TOO_SHORT),
    displayName: z.string().nullable().or(z.literal("")),
    password: z.string().min(8, AuthErrors.VALIDATION.PASSWORD_TOO_SHORT),
    email: z.email(AuthErrors.VALIDATION.INVALID_EMAIL)
        .nullable()
        .or(z.literal("")).transform((val) => {
            if (!val || val === "") return null
        }),
    phoneNumber: z.string()
        .optional()
        .nullable()
        .or(z.literal(""))
        .refine(val => !val || val === "" || /^\+?[0-9\s]+$/.test(val), AuthErrors.VALIDATION.INVALID_PHONE_NUMBER)
        .transform((val) => {
            if (!val || val === "") return null;
            const cleaned = val.replace(/\s+/g, '');
            if (cleaned.length < 10 || cleaned.length > 15) return null;

            return cleaned;
        }),
    organizationId: z.string().optional(),
    organizationName: z.string().min(2, AuthErrors.VALIDATION.ORGANIZATION_NAME_TOO_SHORT).optional(),
});

export const LoginSchema = z.object({
    username: z.string().min(2, AuthErrors.VALIDATION.USERNAME_TOO_SHORT),
    password: z.string().min(8, AuthErrors.VALIDATION.PASSWORD_TOO_SHORT),
});

export type OwnerRegisterInput = z.infer<typeof OwnerRegisterSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;