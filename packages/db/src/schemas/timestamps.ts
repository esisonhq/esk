import { timestamp } from 'drizzle-orm/pg-core';

// Timestamps constants for database table
// Make sure (PostgreSQL) database is set to UTC
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};
