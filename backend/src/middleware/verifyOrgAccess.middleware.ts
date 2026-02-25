import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { ERR } from '../utils/errorMessages.js';
import { HttpStatus } from '../utils/httpStatusCodes.js';
import { userMemberships } from '../db/schema/userMemberships.js';
import { organizations } from '../db/schema/organizations.js';
import { and, eq } from 'drizzle-orm';

export const verifyOrgAccess = async (req: Request, res: Response, next: NextFunction) => {
    const { orgSlug } = req.params;
    const userId = req.user?.id;

    if (typeof orgSlug !== "string" || !userId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ error: ERR.AUTH.UNAUTHORIZED });
    }

    try {
        const [membership] = await db
            .select({
                membership: userMemberships,
                organization: organizations,
            })
            .from(userMemberships)
            .innerJoin(organizations, eq(userMemberships.organizationId, organizations.id))
            .where(
                and(
                    eq(userMemberships.userId, userId),
                    eq(userMemberships.isActive, true),
                    eq(organizations.slug, orgSlug)
                )
            )
            .limit(1);

        if (!membership || membership.organization.slug !== orgSlug) {
            return res.status(HttpStatus.FORBIDDEN).json({ error: ERR.AUTH.FORBIDDEN_ORGANIZATION });
        }

        req.org = {
            id: membership.organization.id,
            role: membership.membership.role
        };
        next();
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: ERR.AUTH.CONTEXT_ERROR });
    }
};