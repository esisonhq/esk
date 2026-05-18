import { z } from '@hono/zod-openapi';

export const IdParamsSchema = z.object({
  id: z.coerce.number().openapi({
    param: {
      name: 'id',
      in: 'path',
      required: true,
    },
    required: ['id'],
    example: 42,
  }),
});

export const UUIDParamsSchema = z.object({
  id: z.uuid().openapi({
    param: {
      name: 'id',
      in: 'path',
      required: true,
    },
    required: ['id'],
    example: '4651e634-a530-4484-9b09-9616a28f35e3',
  }),
});
