import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { addressFields, coordinatesFields, withUpdatesFields } from "../helpers.js";

export const orgTypeEnum = pgEnum("org_type", ["rental", "internal"])
export const orgPlanEnum = pgEnum("org_plan", ["free", "pro", "enterprise"]);
export const billingStatusEnum = pgEnum("billing_status", ["active", "trial", "past_due", "canceled"]);

export const organizations = pgTable('organizations', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    type: orgTypeEnum("type").default("rental").notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    disabledAt: timestamp("disabled_at"),

    plan: orgPlanEnum("plan").default("free").notNull(),
    billingStatus: billingStatusEnum("billing_status").default("active").notNull(),

    trialExpiresAt: timestamp("trial_expires_at"),
    planExpiresAt: timestamp("plan_expires_at"),

    ...addressFields,
    ...coordinatesFields,
    ...withUpdatesFields
});