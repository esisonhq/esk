import z from 'zod';

export const taskSchema = z
  .object({
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
