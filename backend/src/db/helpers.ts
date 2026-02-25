import { and, isNull } from 'drizzle-orm';
import { doublePrecision, text, timestamp } from 'drizzle-orm/pg-core';

export const baseTimestampsFields = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
};

export const withUpdatesFields = {
    ...baseTimestampsFields,
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

export const addressFields = {
    street: text("street"),
    houseNumber: text("house_number"),
    city: text("city"),
    zip: text("zip"),
    country: text("country"),
};

export const coordinatesFields = {
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
}

export const notDeleted = (table: any) => isNull(table.deletedAt);

export const activeOnly = (table: any, ...conditions: any[]) => {
    return and(notDeleted(table), ...conditions);
};