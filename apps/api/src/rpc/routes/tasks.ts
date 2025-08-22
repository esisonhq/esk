import { taskQueries } from '@esk/db/queries';

import { getTaskSchema, insertTaskSchema } from '@/rest/schemas/tasks';
import { protectedProcedure, trpcRouter } from '@/rpc';

export const tasksRouter = trpcRouter({
  get: protectedProcedure
    .input(getTaskSchema)
    .query(async ({ input, ctx: { db } }) => {
      return taskQueries.getById(db, input.id);
    }),

  list: protectedProcedure.query(async ({ ctx: { db } }) => {
    return taskQueries.list(db);
  }),

  create: protectedProcedure
    .input(insertTaskSchema)
    .mutation(async ({ input, ctx: { db } }) => {
      return taskQueries.create(db, input);
    }),
});
