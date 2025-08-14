import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { trpcRouter } from '@/rpc';
import { tasksRouter } from './tasks';

export const appRouter = trpcRouter({
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
