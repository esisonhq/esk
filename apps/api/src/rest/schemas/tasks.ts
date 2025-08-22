import z from 'zod';

import { createTaskSchema, selectTaskSchema } from '@esk/db/schema';

export const taskSchema = selectTaskSchema
  .extend({
    id: z.uuid().openapi({
      description: 'Unique identifier for the task',
      example: '480ea504-36fc-4722-8c5b-ce7a50dae606',
    }),
    name: z.string().openapi({
      description: 'Name of the task',
      example: 'Implement new feature',
    }),
    done: z.boolean().openapi({
      description: 'Indicates if the task is completed',
      example: false,
    }),
    createdAt: z.string().openapi({
      description: 'Creation date of the task in ISO 8601 format',
      example: '2025-01-01T23:59:59.000Z',
    }),
    updatedAt: z.string().openapi({
      description: 'Updated date of the task in ISO 8601 format',
      example: '2025-12-31T00:00:00.000Z',
    }),
  })
  .openapi({
    description: 'Task object',
  });

export const tasksSchema = z.array(taskSchema).openapi({
  description: 'An array of tasks objects',
});

export const getTaskSchema = z.object({
  id: z.uuid().openapi({
    param: {
      in: 'path',
      name: 'id',
    },
    description: 'The ID of the task to retrieve',
    example: '480ea504-36fc-4722-8c5b-ce7a50dae606',
  }),
});

export const insertTaskSchema = createTaskSchema
  .extend({
    name: z.string().min(1).max(500).openapi({
      description: 'Name of the task',
      example: 'Implement new feature',
    }),
    done: z.boolean().default(false).openapi({
      description: 'Indicates if the task is completed',
      example: false,
    }),
  })
  .required({
    name: true,
    done: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const patchTaskSchema = insertTaskSchema.partial();

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type PatchTask = z.infer<typeof patchTaskSchema>;
