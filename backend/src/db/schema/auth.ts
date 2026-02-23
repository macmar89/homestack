import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { createId } from '@paralleldrive/cuid2';
import { withUpdatesFields } from '../helpers.js';

export const refreshTokens = pgTable('refresh_tokens', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    userAgent: text('user_agent'),
    expiresAt: timestamp('expires_at').notNull(),
    ...withUpdatesFields
}, (table) => {
    return {
        userDeviceIdx: uniqueIndex('user_device_idx').on(table.userId, table.userAgent),
    };
});