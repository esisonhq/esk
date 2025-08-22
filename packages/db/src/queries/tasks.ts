import { desc, eq } from 'drizzle-orm';

import type { Database } from '../client';
import { taskTable } from '../schema';

type CreateTaskData = {
  name: string;
  done?: boolean;
};

type UpdateTaskData = {
  name?: string;
  done?: boolean;
};

export const taskQueries = {
  /**
   * Get all tasks ordered by creation date (newest first).
   */
  async list(db: Database) {
    const tasks = await db
      .select()
      .from(taskTable)
      .orderBy(desc(taskTable.createdAt));

    return tasks;
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
   * Create a new task.
   */
  async create(db: Database, data: CreateTaskData) {
    const [task] = await db.insert(taskTable).values(data).returning();
    return task!;
  },

  /**
   * Update a task by ID.
   */
  async update(db: Database, id: string, data: UpdateTaskData) {
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
