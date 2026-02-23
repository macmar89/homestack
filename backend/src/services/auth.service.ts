import crypto from 'crypto';
import { db } from "../db/index.js";
import { refreshTokens } from "../db/schema/auth.js";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/appError.js";
import { generateRefreshToken, generateAccessToken } from "../utils/jwt.js";
import { users } from "../db/schema/users.js";
import { type LoginInput, type RegisterInput } from "../shared/auth.schema.js";
import { AuthErrors } from "../shared/constants/errors/auth.errors.js";
import { households } from "../db/schema/households.js";
import bcrypt from "bcrypt";
import { HttpStatus } from "../utils/httpStatusCodes.js";

const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export const registerUser = async (data: RegisterInput) => {
    const [existingUser] = await db.select().from(users).where(eq(users.email, data.email));
    if (existingUser) {
        throw new AppError(AuthErrors.EMAIL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    return await db.transaction(async (tx) => {
        const [household] = await tx.insert(households).values({
            name: data.householdName,
        }).returning();

        if (!household) throw new AppError(AuthErrors.HOUSEHOLD_CREATION_FAILED, HttpStatus.BAD_REQUEST);

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const [user] = await tx.insert(users).values({
            email: data.email,
            name: data.name,
            password: hashedPassword,
            householdId: household.id,
        }).returning();

        if (!user) throw new AppError(AuthErrors.USER_CREATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);

        return { user };
    });
};

export const loginUser = async (data: LoginInput) => {
    const [user] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        householdId: users.householdId,
        householdName: households.name,
    }).from(users).leftJoin(households, eq(users.householdId, households.id)).where(eq(users.email, data.email));
    if (!user) {
        throw new AppError(AuthErrors.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(AuthErrors.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
}

export const rotateRefreshToken = async (tokenString: string) => {
    const hashedToken = hashToken(tokenString);
    const [dbToken] = await db.select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, hashedToken));

    if (!dbToken || new Date() > dbToken.expiresAt) {
        throw new AppError(AuthErrors.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, dbToken.userId)
    });

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
    });

    const accessToken = generateAccessToken({ id: user.id, householdId: user.householdId });

    return { accessToken, newRefreshToken: newRefreshTokenString, user };
};

export const createSession = async (userId: string, userAgent: string): Promise<string> => {
    const rawToken = generateRefreshToken();
    const hashedToken = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + Number(process.env.COOKIE_REFRESH_MAX_AGE));

    const [session] = await db.insert(refreshTokens).values({
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

    return rawToken;
};

export const logoutUser = async (rawRefreshToken: string) => {
    const hashedToken = hashToken(rawRefreshToken);
    await db.delete(refreshTokens).where(eq(refreshTokens.token, hashedToken));
}