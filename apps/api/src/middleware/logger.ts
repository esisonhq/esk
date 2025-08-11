import { MiddlewareHandler } from 'hono';
import { pinoHttp } from 'pino-http';

import env from '@/env';

/**
 * Middleware to integrate `pino-http` logging into a Hono application.
 *
 * @remarks
 * - Maps Hono's request/response objects to `pino-http`'s expected format.
 * - Injects a logger instance into the Hono context for downstream use.
 * - Ensures that the request ID is passed to the logger for traceability.
 *
 * @example
 * ```ts
 * app.use(logger);
 *
 * app.get('/', (c) => {
 *   c.var.logger.info('Something');
 *   return c.text('Hello world');
 * });
 * ```
 */
const logger: MiddlewareHandler = async (c, next) => {
  // Pass hono's request-id to pino-http
  c.env.incoming.id = c.var.requestId;

  // Configure pino-http with pino-pretty for development
  const pinoHttpInstance = pinoHttp({
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            level: env.LOG_LEVEL || 'info',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });

  // Map express style middleware to hono
  await new Promise<void>((resolve) =>
    pinoHttpInstance(c.env.incoming, c.env.outgoing, () => resolve()),
  );

  // Attach the logger instance to the Hono context
  c.set('logger', c.env.incoming.log);

  await next();
};

export default logger;
