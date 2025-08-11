import { createRoute, z } from '@hono/zod-openapi';

import { createRouter } from '@/lib/create-app';
import { StatusCodes } from '@/lib/http/status-codes';

const router = createRouter().openapi(
  createRoute({
    tags: ['Index'],
    method: 'get',
    path: '/get',
    responses: {
      [StatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z
              .object({
                message: z.string(),
              })
              .openapi({
                example: {
                  message: 'Welcome!',
                },
              }),
          },
        },
        description: 'Returns a welcome message',
      },
    },
  }),
  (c) => {
    return c.json(
      {
        message: 'Welcome!',
      },
      StatusCodes.OK,
    );
  },
);

export default router;
