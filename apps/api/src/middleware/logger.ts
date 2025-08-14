import { MiddlewareHandler } from 'hono';
import { pinoHttp } from 'pino-http';

import { env } from '@esk/utils/env';

/**
 * Middleware to integrate `pino-http` logging into a Hono application.
 *
 * @description
 * This middleware sets up structured logging using `pino-http`, optionally
 * prettified in development mode via `pino-pretty`. It maps Hono's request/response
 * objects to the format expected by `pino-http`, injects a logger instance into
 * the Hono context, and ensures that the request ID is passed through for traceability.
 *
 * @remarks
 * - Uses `c.var.requestId` to propagate request ID to `pino-http`.
 * - In development mode, enables pretty-printing with colorized output.
 * - Compatible with Hono's context and middleware chaining.
 *
 * @param c - The Hono context object, containing request/response and env bindings.
 * @param next - The next middleware or route handler in the chain.
 */
export const withLogger: MiddlewareHandler = async (c, next) => {
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
