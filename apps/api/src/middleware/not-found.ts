import type { NotFoundHandler } from 'hono';

import { StatusCodes } from '@/lib/http/status-codes.js';
import { StatusPhrases } from '@/lib/http/status-phrases.js';
import { ErrorResponse } from '@/types/response';

/**
 * Custom 404 Not Found handler for Hono.
 *
 * @remarks
 * This handler returns a structured JSON response when a route is not matched.
 * It includes metadata such as the error code, message, timestamp, and request path.
 *
 * @param c - The Hono context object.
 * @returns A JSON response with HTTP status 404 and error details.
 *
 * @example
 * ```json
 * {
 *   "success": false,
 *   "message": "Not Found",
 *   "error": {
 *     "code": 404,
 *     "message": "Not Found",
 *     "timestamp": "2025-08-10T17:26:00.000Z",
 *     "path": "/unknown-route"
 *   }
 * }
 * ```
 */
const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      message: StatusPhrases.NOT_FOUND,
      error: {
        code: StatusCodes.NOT_FOUND,
        message: StatusPhrases.NOT_FOUND,
        timestamp: new Date().toISOString(),
        path: c.req.path,
      },
    } as ErrorResponse,
    StatusCodes.NOT_FOUND,
  );
};

export default notFound;
