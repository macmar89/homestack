import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    householdName: z.string().min(2, 'Household name must be at least 2 characters long'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;