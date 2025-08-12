import type { Hook } from '@hono/zod-openapi';

import { StatusCodes } from '@/lib/http/status-codes.js';

/**
 * A default error-handling hook for `OpenAPIHono` that formats Zod validation errors.
 *
 * @remarks
 * This hook is intended to be passed as the `defaultHook` option when initializing an `OpenAPIHono` instance.
 * It intercepts failed validation results and returns a standardized JSON error response.
 *
 * @returns
 * If validation fails (`result.success === false`), responds with:
 * - HTTP status `422 Unprocessable Entity`
 * - JSON body:
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": 422,
 *     "message": "Validation failed",
 *     "timestamp": "2025-08-11T15:00:00.000Z",
 *     "path": "/your/request/path",
 *     "details": {
 *       "name": "ZodError",
 *       "issues": [array of Zod issues]
 *     }
 *   }
 * }
 * ```
 *
 * @param result - The result of Zod validation, containing either success or error details.
 * @param c - The Hono context object, used to construct the response.
 */
const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: result.success,
        error: {
          code: StatusCodes.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          timestamp: new Date().toISOString(),
          path: c.req.path,
          details: {
            name: result.error.name,
            issues: result.error.issues,
          },
        },
      },
      StatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
};

export default defaultHook;
