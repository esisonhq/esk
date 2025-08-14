import { taskQueries } from '@esk/db/queries';

import { protectedProcedure, trpcRouter } from '@/rpc';

export const tasksRouter = trpcRouter({
  list: protectedProcedure.query(async ({ ctx: { db } }) => {
    return taskQueries.list(db);
  }),
});
