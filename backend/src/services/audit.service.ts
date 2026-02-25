import { db } from "../db";
import type { Request } from "express";
import { auditActionEnum, auditLogs } from "../db/schema/auditLogs.js";

export const logActivity = async (
    req: Request,
    action: typeof auditActionEnum.enumValues[number],
    entity: { type: any, id?: string },
    metadata?: any,
    overrides?: { userId?: string; orgId?: string }
) => {
    try {
        await db.insert(auditLogs).values({
            orgId: overrides?.orgId ?? req.org?.id,
            userId: overrides?.userId ?? req.user?.id,
            action: action,
            entityType: entity.type,
            entityId: entity.id,
            metadata: metadata,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
    } catch (err) {
        console.error("Failed to write audit log:", err);
    }
};