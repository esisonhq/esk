import { createRoute, z } from '@hono/zod-openapi';

import { StatusCodes } from '@/lib/http/status-codes';
import { AppRouteHandler } from '@/types/app';

const listRoute = createRoute({
  path: '/',
  method: 'get',
  tags: ['Tasks'],
  responses: {
    [StatusCodes.OK]: {
      content: {
        'application/json': {
          schema: z.array(z.string()),
        },
      },
      description: 'The list of tasks',
    },
  },
});

type ListRoute = typeof listRoute;

const listHandler: AppRouteHandler<ListRoute> = async (c) => {
  const tasks = ['Task 1', 'Task 2', 'Task 3'];
  return c.json(tasks);
};

export { listHandler, listRoute };
export type { ListRoute };
