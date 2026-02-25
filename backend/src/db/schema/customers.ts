import { pgTable, text } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { addressFields, baseTimestampsFields } from "../helpers.js";
import { createId } from "@paralleldrive/cuid2";
import { organizations } from "./organizations.js";

export const customers = pgTable("customers", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    userId: text("user_id").references(() => users.id).unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    idNumber: text("id_number"),

    ...addressFields,
    ...baseTimestampsFields
});