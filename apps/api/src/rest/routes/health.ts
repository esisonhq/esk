import { createRoute, z } from '@hono/zod-openapi';

import { checkDatabaseHealthDetailed } from '@esk/db/health';

import { createRouter } from '@/app';
import { StatusCodes } from '@/lib/http/status-codes';
import { AppRouteHandler } from '@/types/app';

/**
 * Defines the OpenAPI route for checking the health status of the database.
 *
 * @remarks
 * This route is used to monitor the availability and responsiveness of the API and its database connection.
 * It returns different status codes and payloads depending on the health state:
 * - `200 OK` if the database is healthy
 * - `503 Service Unavailable` if the database is degraded
 * - `500 Internal Server Error` if the database is unhealthy or an error occurs
 *
 * @returns A structured JSON response indicating the health status.
 */
const route = createRoute({
  path: '/health',
  method: 'get',
  tags: ['Health'],
  summary: 'Database health check',
  description: 'Check the health status of the database connections',
  responses: {
    [StatusCodes.OK]: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('healthy'),
            timestamp: z.string(),
            latency: z.number().optional(),
            details: z.record(z.string(), z.unknown()).optional(),
          }),
        },
      },
      description: 'Database is healthy',
    },
    [StatusCodes.SERVICE_UNAVAILABLE]: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('degraded'),
            timestamp: z.string(),
            latency: z.number().optional(),
            details: z.record(z.string(), z.unknown()).optional(),
          }),
        },
      },
      description: 'Database is degraded',
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('unhealthy'),
            error: z.string(),
            timestamp: z.string(),
          }),
        },
      },
      description: 'Database is unhealthy',
    },
  },
});

/**
 * Handles the `/health` route by performing a database health check.
 *
 * @param c - The Hono context object, which provides access to the request and environment bindings.
 * @returns A JSON response indicating the health status of the database.
 *
 * @remarks
 * The handler dynamically imports the database client and health check utility.
 * It then evaluates the health status and returns an appropriate response:
 * - `healthy`: Returns `200 OK` with latency and details.
 * - `degraded`: Returns `503 Service Unavailable` with latency and details.
 * - `unhealthy`: Returns `500 Internal Server Error` with error message.
 *
 * If an unexpected error occurs during execution, it returns a fallback `unhealthy` response.
 */
const handler: AppRouteHandler<typeof route> = async (c) => {
  try {
    const db = c.get('db');
    const result = await checkDatabaseHealthDetailed(db);

    if (result.status === 'healthy') {
      return c.json(
        {
          status: 'healthy' as const,
          timestamp: result.timestamp.toISOString(),
          latency: result.latency,
          details: result.details,
        },
        StatusCodes.OK,
      );
    }

    if (result.status === 'degraded') {
      return c.json(
        {
          status: 'degraded' as const,
          timestamp: result.timestamp.toISOString(),
          latency: result.latency,
          details: result.details,
        },
        StatusCodes.SERVICE_UNAVAILABLE,
      );
    }

    return c.json(
      {
        status: 'unhealthy' as const,
        error: result.error || 'Database health check failed',
        timestamp: result.timestamp.toISOString(),
      },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  } catch (error) {
    return c.json(
      {
        status: 'unhealthy' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

const healthRouter = createRouter().openapi(route, handler);
export default healthRouter;
