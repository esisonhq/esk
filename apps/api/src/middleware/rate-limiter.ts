import type { MiddlewareHandler } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';

import type { AppBindings } from '@/types/app';

/**
 * Middleware to apply rate limiting to incoming requests.
 *
 * @description
 * Limits each client to a maximum of 100 requests per 10-minute window.
 * The client is identified by either the authenticated user ID (from session)
 * or their IP address (from request headers).
 *
 * If the limit is exceeded, the middleware responds with a 429 status code
 * and a custom error message.
 *
 * @see {@link https://github.com/honojs/middleware/tree/main/packages/rate-limiter | hono-rate-limiter}
 */
export const withRateLimiter: MiddlewareHandler<AppBindings> = rateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 100,
  keyGenerator: (c) => {
    // Get user ID from session or fall back to IP
    const userId = c.get('user')?.id;
    if (userId) return userId;

    // Fallback to IP address
    const ip =
      c.req.header('CF-Connecting-IP') ||
      c.req.header('X-Forwarded-For') ||
      c.req.header('X-Real-IP') ||
      'unknown';

    return ip;
  },
  message: 'Rate limit exceeded. Please try again later.',
  statusCode: 429,
});
