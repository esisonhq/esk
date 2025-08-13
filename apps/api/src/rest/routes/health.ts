import { createRoute, z } from '@hono/zod-openapi';

import { StatusCodes } from '@/lib/http/status-codes';
import { AppRouteHandler } from '@/types/app';

// Health check route definition
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

const handler: AppRouteHandler<typeof route> = async (c) => {
  try {
    // Import health check utilities
    const { checkDatabaseHealthDetailed } = await import(
      '@esk/db/utils/health'
    );
    const { connectDb } = await import('@esk/db/client');

    const db = await connectDb();
    const result = await checkDatabaseHealthDetailed(db);

    // Return appropriate response based on health status
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
    } else if (result.status === 'degraded') {
      return c.json(
        {
          status: 'degraded' as const,
          timestamp: result.timestamp.toISOString(),
          latency: result.latency,
          details: result.details,
        },
        StatusCodes.SERVICE_UNAVAILABLE,
      );
    } else {
      return c.json(
        {
          status: 'unhealthy' as const,
          error: result.error || 'Database health check failed',
          timestamp: result.timestamp.toISOString(),
        },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
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

export const healthCheck = { route, handler };
