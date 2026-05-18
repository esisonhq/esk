import { createRoute } from '@hono/zod-openapi';

import { taskQueries } from '@esk/db/queries';

import { HttpStatusCodes } from '@/lib/http/status-codes';
import { HttpStatusPhrases } from '@/lib/http/status-phrases';
import { UUIDParamsSchema } from '@/schemas/ids';
import { AppRouteHandler } from '@/types/app';
import { createValidationErrorSchema, notFoundSchema } from '@/types/error';

const route = createRoute({
  path: '/{id}',
  method: 'delete',
  tags: ['Tasks'],
  summary: 'Delete a task',
  operationId: 'deleteTask',
  description: 'Delete a task',
  request: {
    params: UUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Task deleted',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        'application/json': {
          schema: createValidationErrorSchema(UUIDParamsSchema),
        },
      },
      description: 'Invalid id',
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: {
        'application/json': {
          schema: notFoundSchema,
        },
      },
      description: HttpStatusPhrases.NOT_FOUND,
    },
  },
});

const handler: AppRouteHandler<typeof route> = async (c) => {
  const db = c.get('db');
  const { id } = c.req.valid('param');

  const result = await taskQueries.delete(db, id);

  if (!result) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const remove = { route, handler };
