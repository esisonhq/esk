import { desc, eq } from 'drizzle-orm';

import type { Database } from '../client';
import { taskTable, type InsertTask, type PatchTask } from '../schema';

export const taskQueries = {
  /**
   * Get all tasks ordered by creation date (newest first).
   */
  async list(db: Database) {
    return db.select().from(taskTable).orderBy(desc(taskTable.createdAt));
  },

  /**
   * Get a task by ID.
   */
  async getById(db: Database, id: string) {
    const [task] = await db
      .select()
      .from(taskTable)
      .where(eq(taskTable.id, id))
      .limit(1);
    return task;
  },

  /**
   * Get tasks by completion status.
   */
  async getByStatus(db: Database, done: boolean) {
    return db
      .select()
      .from(taskTable)
      .where(eq(taskTable.done, done))
      .orderBy(desc(taskTable.createdAt));
  },

  /**
   * Create a new task.
   */
  async create(db: Database, data: InsertTask) {
    const [task] = await db.insert(taskTable).values(data).returning();
    return task!;
  },

  /**
   * Update a task by ID.
   */
  async update(db: Database, id: string, data: PatchTask) {
    const [task] = await db
      .update(taskTable)
      .set(data)
      .where(eq(taskTable.id, id))
      .returning();
    return task;
  },

  /**
   * Delete a task by ID.
   */
  async delete(db: Database, id: string) {
    const [task] = await db
      .delete(taskTable)
      .where(eq(taskTable.id, id))
      .returning();
    return task;
  },

  /**
   * Toggle task completion status.
   */
  async toggle(db: Database, id: string) {
    const task = await this.getById(db, id);
    if (!task) return null;

    return this.update(db, id, { done: !task.done });
  },

  /**
   * Get task count by status.
   */
  async getStats(db: Database) {
    const allTasks = await this.list(db);
    const completed = allTasks.filter((task) => task.done).length;
    const pending = allTasks.length - completed;

    return {
      total: allTasks.length,
      completed,
      pending,
    };
  },
} as const;
