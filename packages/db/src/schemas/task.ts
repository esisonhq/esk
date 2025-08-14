import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { timestamps } from './timestamps';

export const taskTable = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  done: boolean('done').default(false).notNull(),

  ...timestamps,
});

export const selectTasksSchema = createSelectSchema(taskTable);

export const insertTasksSchema = createInsertSchema(taskTable, {
  name: z.string().min(1).max(500),
})
  .required({
    name: true,
    done: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const patchTasksSchema = insertTasksSchema.partial();

export type Task = typeof taskTable.$inferSelect;
export type SelectTask = z.infer<typeof selectTasksSchema>;
export type InsertTask = z.infer<typeof insertTasksSchema>;
export type PatchTask = z.infer<typeof patchTasksSchema>;
