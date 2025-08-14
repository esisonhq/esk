import { replicationCache } from '@esk/db/cache';
import type { Database } from '@esk/db/client';

// Type guard for replicated database
type DatabaseWithPrimary = Database & {
  usePrimaryOnly: () => Database;
};

/**
 * tRPC middleware that handles replication lag based on mutation operations.
 *
 * For mutations: always use primary DB
 * For queries: use primary DB if the user recently performed a mutation
 */
export const withRPCReadAfterWrite = async <TReturn>(opts: {
  ctx: {
    session?: unknown | null;
    user?: unknown | null;
    db: Database;
    logger: {
      debug: (msg: string) => void;
      error: (msg: string, error?: unknown) => void;
    };
  };
  type: 'query' | 'mutation' | 'subscription';
  next: (opts: {
    ctx: {
      session?: unknown | null;
      user?: unknown | null;
      db: Database;
      logger: {
        debug: (msg: string) => void;
        error: (msg: string, error?: unknown) => void;
      };
    };
  }) => Promise<TReturn>;
}): Promise<TReturn> => {
  const { ctx, type, next } = opts;

  // Get user ID as the cache key (adapt this based on your session structure)
  let cacheKey: string | null = null;

  if (
    ctx.session &&
    typeof ctx.session === 'object' &&
    'userId' in ctx.session
  ) {
    cacheKey = `user:${ctx.session.userId}`;
  }

  let finalDb = ctx.db;

  if (cacheKey) {
    try {
      // For mutations, always use primary DB and mark mutation timestamp
      if (type === 'mutation') {
        ctx.logger.debug(
          `tRPC Mutation detected for ${cacheKey}, using primary DB`,
        );

        // Mark that a mutation occurred
        replicationCache.set(cacheKey);

        // Use primary-only mode if available
        if (
          typeof ctx.db === 'object' &&
          ctx.db !== null &&
          'usePrimaryOnly' in ctx.db
        ) {
          const dbWithPrimary = ctx.db as DatabaseWithPrimary;
          finalDb = dbWithPrimary.usePrimaryOnly();
        }
      }
      // For queries, check if user recently performed a mutation
      else {
        const mutationExpiry = replicationCache.get(cacheKey);

        if (mutationExpiry) {
          const remainingMs = mutationExpiry - Date.now();
          ctx.logger.debug(
            `tRPC Recent mutation for ${cacheKey}, using primary DB for ${remainingMs}ms`,
          );

          // Use primary-only mode if available
          if (
            typeof ctx.db === 'object' &&
            ctx.db !== null &&
            'usePrimaryOnly' in ctx.db
          ) {
            const dbWithPrimary = ctx.db as DatabaseWithPrimary;
            finalDb = dbWithPrimary.usePrimaryOnly();
          }
        } else {
          ctx.logger.debug(
            `tRPC No recent mutations for ${cacheKey}, using replica routing`,
          );
        }
      }
    } catch (error) {
      ctx.logger.error('Error in tRPC read-after-write middleware:', error);
      // Fallback to original database on error
    }
  } else {
    // No user session - for anonymous requests, use primary for mutations only
    if (type === 'mutation') {
      ctx.logger.debug('tRPC Anonymous mutation, using primary DB');

      if (
        typeof ctx.db === 'object' &&
        ctx.db !== null &&
        'usePrimaryOnly' in ctx.db
      ) {
        const dbWithPrimary = ctx.db as DatabaseWithPrimary;
        finalDb = dbWithPrimary.usePrimaryOnly();
      }
    }
  }

  // Update the context with the selected database
  const result = await next({
    ctx: {
      ...ctx,
      db: finalDb,
    },
  });

  return result;
};
