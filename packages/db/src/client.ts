import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '@esk/utils/env';

import * as schema from './schema';
import {
  getPoolConfigForUrl,
  getReplicaRegions,
  getReplicaUrls,
} from './utils/providers';
import { setDatabaseRegion } from './utils/region-detector';
import { withReplicas } from './utils/replicas';

// Set the region before using env.DATABASE_REGION
setDatabaseRegion();

// Primary connection with provider-specific config
const primaryPool = postgres(
  env.DATABASE_PRIMARY_URL,
  getPoolConfigForUrl(env.DATABASE_PRIMARY_URL),
);

// Replica connections, each with their own provider config
const replicaUrls = getReplicaUrls();
const replicaPools = replicaUrls.map((url) =>
  postgres(url, getPoolConfigForUrl(url)),
);

/**
 * Primary Drizzle ORM instance.
 *
 * @remarks
 * Connected to the primary pool and configured with:
 * - `schema`: imported database schema
 * - `casing`: snake_case naming convention
 */
export const primaryDb = drizzle(primaryPool, {
  schema,
  casing: 'snake_case',
});

/**
 * Get replica index based on current region using explicit region mapping.
 *
 * @remarks
 * - Uses DATABASE_REGIONS array to match DATABASE_REPLICAS by index
 * - Falls back to round-robin for unknown regions
 */
const getReplicaIndex = (): number => {
  const region = env.DATABASE_REGION;
  const replicaCount = replicaPools.length;

  // Fallback: round-robin if no region or no replicas
  if (!region || replicaCount === 0) {
    return Math.floor(Date.now() / 1000) % replicaCount;
  }

  // Try to match region explicitly
  const regions = getReplicaRegions();
  const index = regions.findIndex((r) => r === region.toLowerCase());

  if (index !== -1 && index < replicaUrls.length) {
    console.log(
      `Selected replica ${index} for region ${region} (explicit mapping)`,
    );
    return index;
  }

  // Final fallback: round-robin
  console.warn(`No replica found for region ${region}, using round-robin`);
  return Math.floor(Date.now() / 1000) % replicaCount;
};

/**
 * Connects to the database with regional read replicas and retry logic.
 *
 * @remarks
 * - Uses provider abstraction for connection configuration
 * - Automatically selects replicas based on region
 * - Falls back to primary-only mode if no replicas are configured
 * - Ensures consistent schema and casing across all connections
 * - Includes connection retry logic for better resilience
 *
 * @returns A region-aware database instance with read/write routing.
 */
export const connectDb = async (retries = 3) => {
  const connectWithRetry = async (attempt: number) => {
    try {
      // If no replicas are configured, return primary-only instance
      if (replicaPools.length === 0) {
        console.warn('No replica pools configured, using primary-only mode');
        return primaryDb;
      }

      // Test primary connection
      await primaryDb.execute(sql`SELECT 1`);

      // Create Drizzle instances for all replica pools
      const replicaDbs = replicaPools.map((pool) =>
        drizzle(pool, {
          schema,
          casing: 'snake_case',
        }),
      );

      const replicaIndex = getReplicaIndex();

      return withReplicas(
        primaryDb,
        replicaDbs as [typeof primaryDb, ...typeof replicaDbs],
        (replicas) => {
          const selectedReplica = replicas[replicaIndex];
          if (!selectedReplica) {
            console.warn(
              `Replica index ${replicaIndex} not available, using first replica`,
            );
            return replicas[0]!;
          }
          return selectedReplica;
        },
      );
    } catch (error) {
      if (attempt >= retries) {
        console.error('Failed to connect to database after retries:', error);
        throw error;
      }
      console.warn(`Connection attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return connectWithRetry(attempt + 1);
    }
  };

  return connectWithRetry(1);
};

// Type representing a connected database instance with regional replica support.
export type Database = Awaited<ReturnType<typeof connectDb>>;

export type DatabaseWithPrimary = Database & {
  $primary?: Database;
  usePrimaryOnly?: () => Database;
};

// Graceful shutdown helper for closing all database connections.
export const closeDatabaseConnections = async () => {
  await Promise.all([
    primaryPool.end(),
    ...replicaPools.map((pool) => pool.end()),
  ]);
};
