import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import { eq } from "drizzle-orm";
import { activeOnly } from "../../db/helpers.js";
import { AppError } from "../../utils/appError.js";
import { HttpStatus } from "../../utils/httpStatusCodes.js";
import { addMonths } from "date-fns";
import { organizations } from "../../db/schema/index.js";
import bcrypt from "bcrypt";
import { type OwnerRegisterInput } from "../../shared/constants/schema/auth.schema.js";
import { AuthErrors } from "../../shared/constants/errors/auth.errors.js";

export const registerNewOrgAndOwner = async (data: OwnerRegisterInput) => {
    const [existingUser] = await db.select().from(users).where(activeOnly(users, eq(users.username, data.username)));

    if (existingUser) {
        throw new AppError(AuthErrors.USERNAME_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    return await db.transaction(async (tx) => {
        const now = new Date()

        const trialExpiresAt = addMonths(now, 3)

        const [organization] = await tx.insert(organizations).values({
            name: data.organizationName,
            slug: data.slug,
            type: data.organizationType,
            plan: data.withTrial ? "pro" : "free",
            billingStatus: data.withTrial ? "trial" : "active",
            trialExpiresAt: data?.withTrial ? trialExpiresAt : null,
        }).returning();

        if (!organization) throw new AppError(AuthErrors.ORGANIZATION_CREATION_FAILED, HttpStatus.BAD_REQUEST);

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const [user] = await tx.insert(users).values({
            username: data.username,
            displayName: data.displayName,
            password: hashedPassword,
            email: data.email,
            phoneNumber: data.phoneNumber,
        }).returning();

        if (!user) throw new AppError(AuthErrors.USER_CREATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);

        return { user, organization };
    })
}