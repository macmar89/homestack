import { pgTable, text } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { baseTimestampsFields } from '../helpers.js';

export const households = pgTable('households', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    ...baseTimestampsFields
});