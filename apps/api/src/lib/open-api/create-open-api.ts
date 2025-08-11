import { AppOpenAPI } from '@/types/app';
import { Scalar } from '@scalar/hono-api-reference';

import packageJSON from '../../../package.json' with { type: 'json' };

/**
 * Configures OpenAPI documentation and Scalar API reference routes for a Hono application.
 *
 * This function sets up two endpoints:
 * - `/docs`: Serves the raw OpenAPI 3.0 specification generated from the Hono app.
 * - `/reference`: Serves a Scalar-powered interactive API reference UI based on the OpenAPI spec.
 *
 * Scalar provides a modern, customizable interface for exploring and testing API endpoints.
 *
 * @param app - The Hono application instance extended with OpenAPI support.
 *
 * @example
 * ```ts
 * import { OpenAPIHono } from '@hono/zod-openapi';
 * import { createOpenAPI } from '@/lib/create-openapi';
 *
 * const app = new OpenAPIHono();
 * createOpenAPI(app);
 * ```
 *
 * @remarks
 * - The OpenAPI spec version and title are dynamically loaded from `package.json`.
 * - Scalar UI is configured with the `kepler` theme and JavaScript `fetch` client samples.
 *
 * @see {@link https://scalar.com/ Scalar Documentation}
 * @see {@link https://github.com/scalar/scalar/blob/main/documentation/integrations/hono.md Scalar Hono Integration}
 */
export function createOpenAPI(app: AppOpenAPI) {
  app.doc('/docs', {
    openapi: '3.0.0',
    info: {
      version: packageJSON.version,
      title: packageJSON.name,
    },
  });

  app.get(
    '/reference',
    Scalar({
      url: '/docs',
      theme: 'kepler',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
    }),
  );
}
