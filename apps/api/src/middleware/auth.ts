import { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { auth } from '@/lib/auth/auth';

/**
 * Middleware to attach authentication session and user to the request context.
 *
 * @remarks
 * - Uses `better-auth` to extract session from request headers.
 * - Adds `user` and `session` to Hono context for downstream access.
 * - If no session is found, sets both to `null` and continues.
 *
 * @param c - Hono context
 * @param next - Next middleware or route handler
 */
export const withAuth: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  c.set('user', session.user);
  c.set('session', session.session);
  return next();
};

/**
 * Middleware to enforce authentication on protected routes.
 *
 * @remarks
 * - Requires `withAuth` to run before this middleware.
 * - Throws `HTTPException` with 401 status if session or user is missing.
 *
 * @param c - Hono context
 * @param next - Next middleware or route handler
 * @throws HTTPException - If authentication is missing
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  await next();
};
