import { createRoute } from '@hono/zod-openapi';

import { taskQueries } from '@esk/db/queries';

import { StatusCodes } from '@/lib/http/status-codes';
import { tasksSchema } from '@/rest/schemas/tasks';
import { AppRouteHandler } from '@/types/app';
import { serializeDates } from '@/utils/serialize-dates';

const route = createRoute({
  path: '/',
  method: 'get',
  tags: ['Tasks'],
  summary: 'List all tasks',
  operationId: 'listTasks',
  description: 'Retrieve a list of all tasks',
  responses: {
    [StatusCodes.OK]: {
      content: {
        'application/json': {
          schema: tasksSchema,
        },
      },
      description: 'The list of tasks',
    },
  },
});

const handler: AppRouteHandler<typeof route> = async (c) => {
  const db = c.get('db');

  const result = await taskQueries.list(db);
  return c.json(serializeDates(result), StatusCodes.OK);
};

export const list = { route, handler };
