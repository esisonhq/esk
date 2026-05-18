import { createRoute } from '@hono/zod-openapi';

import { taskQueries } from '@esk/db/queries';

import { HttpStatusCodes } from '@/lib/http/status-codes';
import { tasksSchema } from '@/schemas/tasks';
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
    [HttpStatusCodes.OK]: {
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
  return c.json(serializeDates(result), HttpStatusCodes.OK);
};

export const list = { route, handler };
