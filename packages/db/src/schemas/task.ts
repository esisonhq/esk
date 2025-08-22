import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { timestamps } from './timestamps';

export const taskTable = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  done: boolean('done').default(false).notNull(),

  ...timestamps,
});

export const selectTaskSchema = createSelectSchema(taskTable);
export const createTaskSchema = createInsertSchema(taskTable);
