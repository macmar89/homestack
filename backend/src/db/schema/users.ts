import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { baseTimestampsFields } from '../helpers.js';

export const users = pgTable('users', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    username: text('username').notNull().unique(),
    displayName: text('display_name'),
    phoneNumber: text('phone_number'),
    email: text('email'),
    password: text('password').notNull(),

    isActive: boolean('is_active').default(true).notNull(),
    disabledAt: timestamp('disabled_at'),

    isSuperadmin: boolean('is_superadmin').default(false).notNull(),

    needsPasswordChange: boolean('needs_password_change').default(true).notNull(),

    resetPasswordToken: text('reset_password_token'),
    resetPasswordExpires: timestamp('reset_password_expires'),

    lastActiveAt: timestamp('last_active_at'),

    ...baseTimestampsFields
});