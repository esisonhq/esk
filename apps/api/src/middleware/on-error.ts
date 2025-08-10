import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import env from '@/env';
import { StatusCodes } from '@/lib/http/status-codes.js';

/**
 * Global error handler for Hono.
 *
 * @remarks
 * This handler catches unhandled exceptions and returns a structured JSON error response.
 * It adapts the output based on the environment (production vs. development).
 *
 * - In production: hides stack trace and request path.
 * - In development: includes detailed error info for debugging.
 *
 * @param err - The thrown error object.
 * @param c - The Hono context object.
 * @returns A JSON response with appropriate HTTP status and error details.
 *
 * @example
 * ```json
 * {
 *   "success": false,
 *   "message": "An unexpected error occurred.",
 *   "error": {
 *     "code": 500,
 *     "message": "An unexpected error occurred.",
 *     "timestamp": "2025-08-10T17:26:00.000Z"
 *   }
 * }
 * ```
 */
const onError: ErrorHandler = (err, c) => {
  const isProduction = env.NODE_ENV === 'production';

  const statusCode =
    'status' in err && err.status !== StatusCodes.OK
      ? (err.status as ContentfulStatusCode)
      : StatusCodes.INTERNAL_SERVER_ERROR;

  const message = isProduction ? 'An unexpected error occurred.' : err.message;

  return c.json(
    {
      success: false,
      message,
      error: {
        code: statusCode,
        message,
        timestamp: new Date().toISOString(),
        ...(!isProduction && {
          path: c.req.path,
          stack: err.stack,
        }),
      },
    },
    statusCode,
  );
};

export default onError;
