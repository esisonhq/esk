import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const taskTable = pgTable('tasks', {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  name: text().notNull(),
  done: boolean().default(false).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type TaskDB = typeof taskTable.$inferSelect;

export const selectTasksSchema = createSelectSchema(taskTable);

export const insertTasksSchema = createInsertSchema(taskTable, {
  name: z.string().min(1).max(500),
})
  .required({
    done: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const patchTasksSchema = insertTasksSchema.partial();
