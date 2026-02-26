import { z } from 'zod';

export const getLoginSchema = (t: any) => z.object({
    username: z.string().min(2, t('errors.username_too_short')),
    password: z.string().min(8, t('errors.password_too_short')),
});

export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;