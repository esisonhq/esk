import { createMiddleware } from 'hono/factory';

import { replicationCache } from '@esk/db/cache';
import type { DatabaseWithPrimary } from '@esk/db/client';

import type { AppBindings } from '@/types/app';

/**
 * Database middleware that handles replication lag based on mutation operations.
 *
 * For mutations (POST, PUT, PATCH, DELETE): always use primary DB
 * For queries (GET): use primary DB if the user recently performed a mutation
 *
 * This ensures read-after-write consistency while allowing eventual consistency for regular reads.
 */
export const withRESTReadAfterWrite = createMiddleware<AppBindings>(
  async (c, next) => {
    const session = c.get('session');
    const db = c.get('db');
    const logger = c.get('logger');

    // Determine operation type based on HTTP method
    const method = c.req.method;
    const operationType = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
      ? 'mutation'
      : 'query';

    // Get user ID as the cache key (adapt this based on your session structure)
    let cacheKey: string | null = null;

    if (session && typeof session === 'object' && 'userId' in session) {
      cacheKey = `user:${session.userId}`;
    }

    let finalDb = db;

    if (cacheKey) {
      try {
        // For mutations, always use primary DB and mark mutation timestamp
        if (operationType === 'mutation') {
          logger.debug(`Mutation detected for ${cacheKey}, using primary DB`);

          // Mark that a mutation occurred
          replicationCache.set(cacheKey);

          // Use primary-only mode if available
          const dbWithPrimary = db as DatabaseWithPrimary;
          if (dbWithPrimary.usePrimaryOnly) {
            finalDb = dbWithPrimary.usePrimaryOnly();
          }
        }
        // For queries, check if user recently performed a mutation
        else {
          const mutationExpiry = replicationCache.get(cacheKey);

          if (mutationExpiry) {
            const remainingMs = mutationExpiry - Date.now();
            logger.debug(
              `Recent mutation for ${cacheKey}, using primary DB for ${remainingMs}ms`,
            );

            // Use primary-only mode if available
            const dbWithPrimary = db as DatabaseWithPrimary;
            if (dbWithPrimary.usePrimaryOnly) {
              finalDb = dbWithPrimary.usePrimaryOnly();
            }
          } else {
            logger.debug(
              `No recent mutations for ${cacheKey}, using replica routing`,
            );
          }
        }
      } catch (error) {
        logger.error({
          msg: 'Error in read-after-write middleware',
          error,
          cacheKey,
          operationType,
          method: c.req.method,
        });
        // Fallback to original database on error
      }
    } else {
      // No user session - for anonymous requests, use primary for mutations only
      if (operationType === 'mutation') {
        logger.debug('Anonymous mutation, using primary DB');

        const dbWithPrimary = db as DatabaseWithPrimary;
        if (dbWithPrimary.usePrimaryOnly) {
          finalDb = dbWithPrimary.usePrimaryOnly();
        }
      }
    }

    // Update the database in context
    c.set('db', finalDb);

    await next();
  },
);
