import { timestamp } from 'drizzle-orm/pg-core';

export const baseTimestampsFields = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
};

export const withUpdatesFields = {
    ...baseTimestampsFields,
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
};