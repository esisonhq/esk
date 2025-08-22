import { createRoute } from '@hono/zod-openapi';

import { taskQueries } from '@esk/db/queries';

import { StatusCodes } from '@/lib/http/status-codes';
import { StatusPhrases } from '@/lib/http/status-phrases';
import { getTaskSchema, taskSchema } from '@/rest/schemas/tasks';
import { AppRouteHandler } from '@/types/app';
import { createValidationErrorSchema, notFoundSchema } from '@/types/error';
import { serializeDates } from '@/utils/serialize-dates';

const route = createRoute({
  path: '/{id}',
  method: 'get',
  tags: ['Tasks'],
  summary: 'Retrieve a task',
  operationId: 'getTask',
  description: 'Retrieve a single task by its ID',
  request: {
    params: getTaskSchema,
  },
  responses: {
    [StatusCodes.OK]: {
      content: {
        'application/json': {
          schema: taskSchema,
        },
      },
      description: 'The task',
    },
    [StatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        'application/json': {
          schema: createValidationErrorSchema(getTaskSchema),
        },
      },
      description: 'Invalid id',
    },
    [StatusCodes.NOT_FOUND]: {
      content: {
        'application/json': {
          schema: notFoundSchema,
        },
      },
      description: StatusPhrases.NOT_FOUND,
    },
  },
});

const handler: AppRouteHandler<typeof route> = async (c) => {
  const db = c.get('db');
  const { id } = c.req.valid('param');

  const result = await taskQueries.getById(db, id);

  if (!result) {
    return c.json({ message: StatusPhrases.NOT_FOUND }, StatusCodes.NOT_FOUND);
  }

  return c.json(serializeDates(result), StatusCodes.OK);
};

export const get = { route, handler };
