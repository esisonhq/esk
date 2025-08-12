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
