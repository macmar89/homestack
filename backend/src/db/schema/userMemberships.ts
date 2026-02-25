import { createId } from "@paralleldrive/cuid2";
import { pgEnum, pgTable, text, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations } from "./organizations";
import { withUpdatesFields } from "../helpers";

export const userRoleEnum = pgEnum("user_role", ["owner", "admin", "staff"]);

export const userMemberships = pgTable("user_memberships", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    role: userRoleEnum("role").notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    disabledAt: timestamp("disabled_at"),

    ...withUpdatesFields
}, (table) => [
    uniqueIndex("user_org_unique_idx").on(table.userId, table.organizationId),
    index("membership_org_id_idx").on(table.organizationId),
    index("membership_user_id_idx").on(table.userId)
]);