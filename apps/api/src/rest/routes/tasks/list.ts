import { createRoute, z } from '@hono/zod-openapi';

import { StatusCodes } from '@/lib/http/status-codes';
import { AppRouteHandler } from '@/types/app';

const route = createRoute({
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

const handler: AppRouteHandler<typeof route> = async (c) => {
  const tasks = ['Task 1', 'Task 2', 'Task 3'];
  return c.json(tasks, StatusCodes.OK);
};

export const list = { route, handler };
