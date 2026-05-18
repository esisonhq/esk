import { HttpStatusCodes } from '@/lib/http/status-codes';
import { HttpStatusPhrases } from '@/lib/http/status-phrases';
import { z } from '@hono/zod-openapi';

/**
 * Base API error schema
 */
export const apiErrorSchema = z.object({
  code: z.number().openapi({
    description: 'HTTP status code',
    example: HttpStatusCodes.UNPROCESSABLE_ENTITY,
  }),
  message: z.string().openapi({
    description: 'Error message',
    example: HttpStatusPhrases.UNPROCESSABLE_ENTITY,
  }),
  timestamp: z.string().openapi({
    description: 'ISO timestamp when the error occurred',
    example: '2025-08-22T12:00:00.000Z',
  }),
  requestId: z.string().openapi({
    description: 'Unique identifier for this request',
    example: 'req_123456789',
  }),
  path: z.string().openapi({
    description: 'API path that generated the error',
    example: '/v1/tasks',
  }),
  details: z.unknown().optional().openapi({
    description: 'Additional error details (varies by error type)',
  }),
  stack: z.string().optional().openapi({
    description: 'Error stack trace (only in development)',
  }),
});

/**
 * Standard error response schema
 */
export const errorResponseSchema = z.object({
  success: z.literal(false).openapi({
    description: 'Indicates the request failed',
    example: false,
  }),
  message: z.string().openapi({
    description: 'Error message',
    example: HttpStatusPhrases.UNPROCESSABLE_ENTITY,
  }),
  error: apiErrorSchema,
});

/**
 * Standard not found response schema
 */
export const notFoundSchema = z.object({
  success: z.literal(false).openapi({
    description: 'Indicates resource not found',
    example: false,
  }),
  message: z.string().openapi({
    description: 'Error message',
    example: HttpStatusPhrases.NOT_FOUND,
  }),
  error: apiErrorSchema,
});

/**
 * Validation error details schema
 */
export const validationErrorDetailsSchema = z.array(
  z.object({
    field: z.string().openapi({
      description: 'Field path that failed validation',
      example: 'name',
    }),
    expected: z.string().optional().openapi({
      description: 'Expected value type',
      example: 'string',
    }),
    received: z.string().optional().openapi({
      description: 'Received value type',
      example: 'undefined',
    }),
    message: z.string().openapi({
      description: 'Validation error message',
      example: 'Required',
    }),
    code: z.string().openapi({
      description: 'Zod error code',
      example: 'invalid_type',
    }),
  }),
);

/**
 * Creates a validation error schema with realistic examples based on the input schema
 */
export const createValidationErrorSchema = <T extends ZodSchema>(
  inputSchema: T,
) => {
  // Generate realistic validation error example (your existing logic)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isArraySchema = (inputSchema as any)._def.type === 'array';
  const testValue = isArraySchema
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [(inputSchema as any).element._def.type === 'string' ? 123 : 'invalid']
    : {};

  const { error } = inputSchema.safeParse(testValue);

  const exampleDetails = error
    ? error.issues.map((issue) => ({
        field: issue.path.join('.'),
        expected: 'expected' in issue ? String(issue.expected) : undefined,
        received: 'received' in issue ? String(issue.received) : undefined,
        message: issue.message,
        code: issue.code,
      }))
    : [
        {
          field: 'name',
          expected: 'string',
          received: 'undefined',
          message: 'Required',
          code: 'invalid_type',
        },
      ];

  // Return schema with validation-specific details
  return errorResponseSchema.extend({
    error: apiErrorSchema.extend({
      details: validationErrorDetailsSchema.optional().openapi({
        description: 'Detailed validation errors',
        example: exampleDetails,
      }),
    }),
  });
};

/**
 * Generic validation error schema
 */
export const validationErrorSchema = createValidationErrorSchema(
  z.object({ name: z.string() }), // Generic example schema
);

// Export inferred types
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type NotFoundResponse = z.infer<typeof notFoundSchema>;
export type ValidationErrorDetails = z.infer<
  typeof validationErrorDetailsSchema
>;

// ZodSchema types
export type ZodSchema =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | z.ZodUnion<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | z.ZodObject<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | z.ZodArray<any>;
export type ZodIssue = z.core.$ZodIssue;
