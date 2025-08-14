import type { MiddlewareHandler } from 'hono';

import { connectDb } from '@esk/db/client';

/**
 * Middleware to initialize and attach a database connection to the Hono context.
 *
 * @description
 * This middleware uses `connectDb()` to establish a connection to the database,
 * and stores the resulting client instance in the context using `c.set('db', db)`.
 * This allows downstream handlers and other middleware to access the database
 * via `c.get('db')`.
 *
 * @param c - The Hono context object.
 * @param next - The next middleware or handler in the chain.
 */
export const withDatabase: MiddlewareHandler = async (c, next) => {
  const db = await connectDb();
  c.set('db', db);
  await next();
};
