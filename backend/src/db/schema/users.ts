import { pgTable, text } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { households } from './households.js';
import { baseTimestampsFields } from '../helpers.js';

export const users = pgTable('users', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    householdId: text('household_id').references(() => households.id),
    ...baseTimestampsFields
});