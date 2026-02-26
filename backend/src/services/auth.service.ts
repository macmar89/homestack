import crypto from 'crypto';
import type { Request } from 'express';
import { db } from "../db/index.js";
import { refreshTokens } from "../db/schema/auth.js";
import { and, eq } from "drizzle-orm";
import { AppError } from "../utils/appError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { type LoginInput, type RegisterInput } from "../shared/constants/schema/auth.schema.js";
import { AuthErrors } from "../shared/constants/errors/auth.errors.js";
import { HttpStatus } from "../utils/httpStatusCodes.js";
import { activeOnly } from '../db/helpers.js';
import { logActivity } from './audit.service.js';
import { verifyPassword } from '../utils/crypto.js';
import { users } from '../db/schema/users.js';

const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// export const registerUser = async (data: RegisterInput) => {
//     const [existingUser] = await db.select().from(users).where(eq(users.username, data.username));

//     if (existingUser) {
//         throw new AppError(AuthErrors.USERNAME_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
//     }

//     return await db.transaction(async (tx) => {
//         const [organization] = await tx.insert(organizations).values({
//             name: data.organizationName,
//             slug: data.organizationName.toLowerCase().replace(/\s+/g, '-'),
//         }).returning();

//         if (!organization) throw new AppError(AuthErrors.ORGANIZATION_CREATION_FAILED, HttpStatus.BAD_REQUEST);

//         const hashedPassword = hashPassword(data.password);

//         const [user] = await tx.insert(users).values({
//             username: data.username,
//             displayName: data.displayName,
//             password: hashedPassword,
//             email: data.email,
//             phoneNumber: data.phoneNumber,
//             organizationId: organization.id,
//         }).returning();

//         if (!user) throw new AppError(AuthErrors.USER_CREATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);

//         return { user, organization };
//     });
// };

export const loginUser = async (data: LoginInput, req: Request) => {
    const user = await db.query.users.findFirst({
        where: (users, { eq, and }) => and(eq(users.username, data.username), activeOnly(users)),
        columns: {
            id: true,
            username: true,
            displayName: true,
            isSuperadmin: true,
            password: true,
            defaultOrgId: true,
        },
        with: {
            memberships: {
                where: (memberships, { isNull }) => isNull(memberships.deletedAt),
                with: {
                    organization: {
                        columns: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        await logActivity(
            req,
            "LOGIN_FAILED",
            { type: "auth" },
            { attemptedUsername: data.username, reason: "USER_NOT_FOUND" },
        );

        throw new AppError(AuthErrors.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await verifyPassword(user.password, data.password);
    if (!isPasswordValid) {
        await logActivity(
            req,
            "LOGIN_FAILED",
            { type: "auth", id: user?.id },
            { attemptedUsername: data.username, reason: "INVALID_PASSWORD" },
            { userId: user.id }
        );

        throw new AppError(AuthErrors.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const { password, memberships, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        orgs: memberships.map(m => ({
            ...m.organization,
            role: m.role
        }))
    };
}

export const rotateRefreshToken = async (tokenString: string) => {
    const hashedToken = hashToken(tokenString);
    const [dbToken] = await db.select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, hashedToken));

    if (!dbToken || new Date() > dbToken.expiresAt) {
        throw new AppError(AuthErrors.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const [user] = await db.select({ id: users.id, isSuperadmin: users.isSuperadmin })
        .from(users).where(and(eq(users.id, dbToken.userId), eq(users.isActive, true)))
        .limit(1)

    if (!user) throw new AppError(AuthErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const newRefreshTokenString = generateRefreshToken();
    const hashedNewToken = hashToken(newRefreshTokenString);

    await db.transaction(async (tx) => {
        await tx.delete(refreshTokens).where(eq(refreshTokens.id, dbToken.id));

        await tx.insert(refreshTokens).values({
            userId: user.id,
            token: hashedNewToken,
            userAgent: dbToken.userAgent,
            expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_IN_MS)),
        });

        await tx.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, user.id))
    });

    const accessToken = generateAccessToken({ id: user.id, isSuperadmin: user.isSuperadmin });

    return { accessToken, newRefreshToken: newRefreshTokenString, user };
};

export const createSession = async (userId: string, userAgent: string): Promise<string> => {
    const rawToken = generateRefreshToken();
    const hashedToken = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + Number(process.env.COOKIE_REFRESH_MAX_AGE));

    return await db.transaction(async (tx) => {
        const [session] = await tx.insert(refreshTokens).values({
            userId,
            token: hashedToken,
            userAgent,
            expiresAt,
        }).onConflictDoUpdate({
            target: [refreshTokens.userId, refreshTokens.userAgent],
            set: {
                token: hashedToken,
                expiresAt,
                updatedAt: new Date(),
            }
        }).returning();

        if (!session) {
            throw new AppError(AuthErrors.SESSION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await tx.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, userId))

        return rawToken;
    })
};

export const logoutUser = async (rawRefreshToken: string) => {
    const hashedToken = hashToken(rawRefreshToken);

    return await db.transaction(async (tx) => {
        const [deletedToken] = await tx.delete(refreshTokens).where(eq(refreshTokens.token, hashedToken)).returning({ userId: refreshTokens.userId });

        if (deletedToken) {
            await tx.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, deletedToken?.userId))
            return deletedToken.userId
        }

        return null
    })
}

export const getUserProfile = async (userId: string) => {
    const user = await db.query.users.findFirst({
        where: (users, { eq, and }) => and(eq(users.id, userId), activeOnly(users)),
        columns: {
            id: true,
            username: true,
            displayName: true,
            isSuperadmin: true,
            defaultOrgId: true,
        },
        with: {
            memberships: {
                where: (memberships, { isNull }) => isNull(memberships.deletedAt),
                with: {
                    organization: {
                        columns: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        throw new AppError(AuthErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const { memberships, ...userStats } = user

    return {
        user: userStats,
        orgs: memberships.map(m => ({
            ...m.organization,
            role: m.role
        }))
    };
}