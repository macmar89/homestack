import { z } from "zod";

export const UserResponseSchema = z.object({
    user: z.object({
        id: z.string(),
        username: z.string(),
        displayName: z.string().nullable(),
        isSuperadmin: z.boolean(),
        defaultOrgId: z.string().nullable()
    }),
    orgs: z.array(z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        role: z.string()
    }))
});

export type User = z.infer<typeof UserResponseSchema>;