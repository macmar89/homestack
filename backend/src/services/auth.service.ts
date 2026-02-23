import { db } from "../db/index.js";
import { refreshTokens } from "../db/schema/auth.js";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/appError.js";
import { generateRefreshToken, generateAccessToken } from "../utils/jwt.js";
import { users } from "../db/schema/users.js";
import { type RegisterInput } from "../shared/auth.schema.js";
import { households } from "../db/schema/households.js";
import bcrypt from "bcrypt";
import { HttpStatus } from "../utils/httpStatusCodes.js";

export const registerUser = async (data: RegisterInput) => {
    const [existingUser] = await db.select().from(users).where(eq(users.email, data.email));
    if (existingUser) {
        throw new AppError('User with this email already exists', HttpStatus.BAD_REQUEST);
    }

    return await db.transaction(async (tx) => {
        const [household] = await tx.insert(households).values({
            name: data.householdName,
        }).returning();

        if (!household) throw new AppError('Failed to create household', HttpStatus.BAD_REQUEST);

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const [user] = await tx.insert(users).values({
            email: data.email,
            name: data.name,
            password: hashedPassword,
            householdId: household.id,
        }).returning();

        if (!user) throw new AppError('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);

        return { user };
    });
};

export const rotateRefreshToken = async (tokenString: string) => {
    const [dbToken] = await db.select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, tokenString));

    if (!dbToken || new Date() > dbToken.expiresAt) {
        throw new AppError('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED);
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, dbToken.userId)
    });

    if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND);

    const newRefreshTokenString = generateRefreshToken();

    await db.transaction(async (tx) => {
        await tx.delete(refreshTokens).where(eq(refreshTokens.id, dbToken.id));

        await tx.insert(refreshTokens).values({
            userId: user.id,
            token: newRefreshTokenString,
            userAgent: dbToken.userAgent, // Zachováme info o zariadení
            expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_IN_MS)),
        });
    });

    const accessToken = generateAccessToken({ id: user.id, householdId: user.householdId });

    return { accessToken, newRefreshToken: newRefreshTokenString, user };
};