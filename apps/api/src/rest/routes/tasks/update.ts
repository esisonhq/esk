import { createRoute } from '@hono/zod-openapi';

import { taskQueries } from '@esk/db/queries';

import { HttpStatusCodes } from '@/lib/http/status-codes';
import { HttpStatusPhrases } from '@/lib/http/status-phrases';
import { UUIDParamsSchema } from '@/schemas/ids';
import { patchTaskSchema, taskSchema } from '@/schemas/tasks';
import { AppRouteHandler } from '@/types/app';
import { createValidationErrorSchema, notFoundSchema } from '@/types/error';
import { serializeDates } from '@/utils/serialize-dates';

const route = createRoute({
  path: '/{id}',
  method: 'patch',
  tags: ['Tasks'],
  summary: 'Update a task',
  operationId: 'patchTask',
  description: 'Update a task',
  request: {
    params: UUIDParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: patchTaskSchema,
        },
      },
      description: 'The task to update',
    },
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        'application/json': {
          schema: taskSchema,
        },
      },
      description: 'The updated task',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        'application/json': {
          // TODO: This created anyOf instead of oneOf
          schema: createValidationErrorSchema(patchTaskSchema).or(
            createValidationErrorSchema(UUIDParamsSchema),
          ),
        },
      },
      description: 'The validation error(s)',
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
  const updates = c.req.valid('json');
  const { id } = c.req.valid('param');

  const result = await taskQueries.update(db, id, updates);

  if (!result) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(serializeDates(result), HttpStatusCodes.OK);
};

export const update = { route, handler };
