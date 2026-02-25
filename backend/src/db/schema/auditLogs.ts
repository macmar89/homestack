import { pgTable, text, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { organizations } from "./organizations";

export const auditActionEnum = pgEnum("audit_action", [
    "LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT", "PASSWORD_CHANGE",
    "ORG_CREATE", "ORG_UPDATE", "ORG_PLAN_CHANGE",
    "USER_INVITE", "USER_REMOVE", "USER_ROLE_UPDATE",
    "RENTAL_CREATE", "RENTAL_UPDATE", "RENTAL_RETURN", "RENTAL_CANCEL",
    "ASSET_CREATE", "ASSET_UPDATE", "ASSET_DELETE"
]);

export const entityTypeEnum = pgEnum("entity_type", [
    "user", "organization", "rental", "asset", "auth"
]);

export const auditLogs = pgTable("audit_logs", {
    id: text("id").primaryKey().$defaultFn(() => createId()),

    orgId: text("org_id").references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

    action: auditActionEnum("action").notNull(),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id"),

    metadata: jsonb("metadata"),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
},
    (table) => [
        index("audit_logs_org_id_idx").on(table.orgId),
        index("audit_logs_created_at_idx").on(table.createdAt)
    ]);