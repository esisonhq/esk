import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

import { env } from '@esk/utils/env';

import { StatusCodes } from '@/lib/http/status-codes.js';
import { StatusPhrases } from '@/lib/http/status-phrases';
import { ErrorResponse } from '@/types/response';
import { formatZodError } from '@/utils/format-zod-error';

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

  const timestamp = new Date().toISOString();
  const requestId = c.get('requestId') || 'unknown';
  const path = c.req.path;

  // Log all errors for debugging
  const logger = c.get('logger');
  logger.error({
    error: err,
    requestId,
    path,
    method: c.req.method,
    userAgent: c.req.header('User-Agent'),
  });

  // Handle HTTPException Error
  if (err instanceof HTTPException) {
    const code =
      'status' in err && err.status !== StatusCodes.OK
        ? (err.status as ContentfulStatusCode)
        : StatusCodes.INTERNAL_SERVER_ERROR;

    const message = isProduction
      ? 'An unexpected error occurred.'
      : err.message;

    return c.json(
      {
        success: false,
        message,
        error: {
          code,
          message,
          timestamp,
          requestId,
          path,
          ...(!isProduction && { stack: err.stack }),
        },
      } as ErrorResponse,
      code,
    );
  }

  // Handle ZodError
  if (err instanceof ZodError) {
    const errorResponse = formatZodError(err, c, !isProduction);
    return c.json(errorResponse, StatusCodes.UNPROCESSABLE_ENTITY);
  }

  // Handle Other Errors
  return c.json(
    {
      success: false,
      message: StatusPhrases.INTERNAL_SERVER_ERROR,
      error: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: StatusPhrases.INTERNAL_SERVER_ERROR,
        timestamp,
        requestId,
        path,
        ...(!isProduction && { stack: err.stack }),
      },
    } as ErrorResponse,
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};

export default onError;
