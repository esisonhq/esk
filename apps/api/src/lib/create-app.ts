/**
 * Initializes and configures the Hono application with middleware and error handling.
 *
 * This module sets up a typed Hono app using `@hono/zod-openapi`, integrates common middleware,
 * and provides a clean entry point for building routes and handling requests.
 *
 * @module App
 */

import { OpenAPIHono } from '@hono/zod-openapi';
import { requestId } from 'hono/request-id';

import defaultHook from '@/lib/open-api/default-hook';
import logger from '@/middleware/logger';
import notFound from '@/middleware/not-found';
import onError from '@/middleware/on-error';
import { AppBindings } from '@/types/app';

/**
 * Creates a new instance of `OpenAPIHono` with optional bindings and default configuration.
 *
 * @remarks
 * This function initializes an OpenAPI-compatible Hono router with:
 * - `strict: false` to allow flexible route definitions
 * - A custom `defaultHook` to handle Zod validation errors consistently across all routes
 *
 * The `defaultHook` ensures that any validation failures return a structured JSON response
 * with HTTP status `422 Unprocessable Entity`, including error details from Zod.
 *
 * @example
 * ```ts
 * import { createRouter } from '@/router';
 *
 * const router = createRouter();
 *
 * router.openapi(...); // Define OpenAPI routes
 *
 * export default router;
 * ```
 *
 * @returns A new `OpenAPIHono` instance typed with `AppBindings`, ready for route registration.
 *
 * @see {@link https://github.com/honojs/zod-openapi} — Zod OpenAPI integration for Hono
 * @see {@link https://zod.dev} — Zod validation library
 */
export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

/**
 * Creates and configures the main Hono application.
 *
 * @remarks
 * This function sets up the core application logic by:
 * - Initializing the router via `createRouter`, which includes OpenAPI support and a default validation hook
 * - Applying middleware for request ID injection and logging
 * - Defining custom handlers for 404 (not found) and general error responses
 *
 * The resulting app is ready for route registration and server startup.
 *
 * @returns A fully configured `OpenAPIHono` application instance.
 */
export function createApp() {
  // Create the router
  const app = createRouter();

  // Set request ID for tracking
  app.use(requestId());

  // Logger middleware for debugging
  app.use(logger);

  // Default Handlers
  app.notFound(notFound);
  app.onError(onError);

  return app;
}
