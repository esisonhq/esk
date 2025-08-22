import { createRoute } from '@hono/zod-openapi';

import { taskQueries } from '@esk/db/queries';

import { StatusCodes } from '@/lib/http/status-codes';
import { insertTaskSchema, taskSchema } from '@/rest/schemas/tasks';
import { AppRouteHandler } from '@/types/app';
import { createValidationErrorSchema } from '@/types/error';
import { serializeDates } from '@/utils/serialize-dates';

const route = createRoute({
  path: '/',
  method: 'post',
  tags: ['Tasks'],
  summary: 'Create a new task',
  operationId: 'createTask',
  description: 'Create a new task',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertTaskSchema,
        },
      },
      description: 'The task to create',
    },
  },
  responses: {
    [StatusCodes.CREATED]: {
      content: {
        'application/json': {
          schema: taskSchema,
        },
      },
      description: 'The created task',
    },
    [StatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        'application/json': {
          schema: createValidationErrorSchema(insertTaskSchema),
        },
      },
      description: 'The validation error(s)',
    },
  },
});

const handler: AppRouteHandler<typeof route> = async (c) => {
  const db = c.get('db');
  const task = c.req.valid('json');

  const createdTask = await taskQueries.create(db, task);
  return c.json(serializeDates(createdTask), StatusCodes.CREATED);
};

export const create = { route, handler };
