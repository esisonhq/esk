import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import type { Database } from './client';
import env from './env';
import { createDatabaseProvider } from './providers';
import * as schema from './schemas';

/**
 * Creates a new job-optimized database instance with its own connection pool.
 *
 * @remarks
 * This function is intended for short-lived job workflows that require isolated
 * database access. It ensures minimal resource usage and avoids overwhelming
 * the database connection pooler.
 *
 * Connection pool configuration:
 * - `max: 1` — restricts to a single connection per job
 * - `idle_timeout: 10` — disconnects idle clients after 10 seconds
 * - `max_lifetime: 1800` — closes connections after 30 minutes
 * - `connect_timeout: 10` — fails if unable to connect within 10 seconds
 *
 * @returns An object containing:
 * - `db`: a Drizzle ORM instance typed as `Database`
 * - `disconnect`: a function to gracefully close the connection pool
 */
export const createJobDb = () => {
  const provider = createDatabaseProvider();

  // Override provider config for job-specific optimizations
  const jobPoolConfig = {
    ...provider.getPoolConfig(),
    max: 1, // Critical: only 1 connection per job to avoid flooding pooler
    idle_timeout: 10, // Free idle clients very quickly (10 seconds)
    max_lifetime: 60 * 30, // Close connections after 30 minutes
    connect_timeout: 10, // 10 second connection timeout
  };

  const jobPool = postgres(env.DATABASE_PRIMARY_POOLER_URL!, jobPoolConfig);

  const db = drizzle(jobPool, {
    schema,
    casing: 'snake_case',
  });

  return {
    db: db as Database,
    disconnect: () => jobPool.end(),
  };
};
