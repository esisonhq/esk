import type { Context } from 'hono';
import { ZodError } from 'zod';

import { StatusCodes } from '@/lib/http/status-codes';
import type { ErrorResponse } from '@/types/response';

/**
 * Formats a `ZodError` into a standardized error response object.
 *
 * @remarks
 * This utility transforms Zod validation errors into a consistent structure
 * compatible with your API's `ErrorResponse` format. It includes metadata such as
 * timestamp, request ID, and request path, and optionally includes debug info like stack trace.
 *
 * @param error - The `ZodError` instance thrown during schema validation
 * @param c - The Hono context, used to extract request metadata
 * @param includeDebugInfo - Whether to include the error stack trace in the response (default: `false`)
 *
 * @returns A structured `ErrorResponse` object containing validation failure details
 */
export function formatZodError(
  error: ZodError,
  c: Context,
  includeDebugInfo = false,
): ErrorResponse {
  const timestamp = new Date().toISOString();
  const requestId = c.get('requestId') || 'unknown';
  const path = c.req.path;

  return {
    success: false,
    message: 'Validation failed',
    error: {
      code: StatusCodes.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      timestamp,
      requestId,
      path,
      ...(includeDebugInfo && { stack: error.stack }),
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        received: 'received' in issue ? issue.received : undefined,
      })),
    },
  };
}
