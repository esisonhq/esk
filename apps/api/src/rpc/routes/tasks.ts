import { TRPCError } from '@trpc/server';
import z from 'zod';

import { taskQueries } from '@esk/db/queries';

import { protectedProcedure, trpcRouter } from '@/rpc';
import { UUIDParamsSchema } from '@/schemas/ids';
import { insertTaskSchema, patchTaskSchema } from '@/schemas/tasks';

export const tasksRouter = trpcRouter({
  // GET /tasks/:id
  get: protectedProcedure
    .input(UUIDParamsSchema)
    .query(async ({ input, ctx: { db } }) => {
      const task = await taskQueries.getById(db, input.id);

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      return task;
    }),

  // GET /tasks
  list: protectedProcedure.query(async ({ ctx: { db } }) => {
    return taskQueries.list(db);
  }),

  // POST /tasks
  create: protectedProcedure
    .input(insertTaskSchema)
    .mutation(async ({ input, ctx: { db } }) => {
      return taskQueries.create(db, input);
    }),

  // PATCH /tasks/:id
  update: protectedProcedure
    .input(
      z.object({
        params: UUIDParamsSchema,
        body: patchTaskSchema,
      }),
    )
    .mutation(async ({ input, ctx: { db } }) => {
      const {
        params: { id },
        body,
      } = input;
      const updated = await taskQueries.update(db, id, body);

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      return updated;
    }),

  // DELETE /tasks/:id
  remove: protectedProcedure
    .input(UUIDParamsSchema)
    .mutation(async ({ input, ctx: { db } }) => {
      const deleted = await taskQueries.delete(db, input.id);

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      return null;
    }),
});
