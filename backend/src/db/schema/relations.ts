import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { organizations } from "./organizations.js";
import { userMemberships } from "./userMemberships.js";

export const usersRelations = relations(users, ({ many }) => ({
    memberships: many(userMemberships),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
    userMemberships: many(userMemberships),
}));

export const userMembershipsRelations = relations(userMemberships, ({ one }) => ({
    user: one(users, {
        fields: [userMemberships.userId],
        references: [users.id],
        relationName: "user_to_membership"
    }),
    organization: one(organizations, {
        fields: [userMemberships.organizationId],
        references: [organizations.id],
    }),
}));
