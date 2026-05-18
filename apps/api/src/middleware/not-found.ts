import type { NotFoundHandler } from 'hono';

import { HttpStatusCodes } from '@/lib/http/status-codes.js';
import { HttpStatusPhrases } from '@/lib/http/status-phrases.js';
import { NotFoundResponse } from '@/types/error';

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
  const timestamp = new Date().toISOString();
  const requestId = c.get('requestId') || 'unknown';
  const path = c.req.path;

  return c.json(
    {
      success: false,
      message: HttpStatusPhrases.NOT_FOUND,
      error: {
        code: HttpStatusCodes.NOT_FOUND,
        message: HttpStatusPhrases.NOT_FOUND,
        timestamp,
        requestId,
        path,
      },
    } as NotFoundResponse,
    HttpStatusCodes.NOT_FOUND,
  );
};

export default notFound;
