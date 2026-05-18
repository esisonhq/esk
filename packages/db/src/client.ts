import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';
import { getDatabaseConfig, getRegion } from './utils/get-config';
import { replicaStrategies, withReplicas } from './utils/replicas';

const config = getDatabaseConfig();

// Primary connection with provider-specific config
const primaryPool = postgres(config.primary.url, config.primary.poolConfig);

// Replica connections, each with their own provider config
const replicaPools = config.replicas.map((replica) =>
  postgres(replica.url, replica.poolConfig),
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
      // Test primary connection
      await primaryDb.execute(sql`SELECT 1`);

      // If no replicas are configured, return primary-only instance
      if (replicaPools.length === 0) {
        console.warn('No replica pools configured, using primary-only mode');
        return primaryDb;
      }

      // Create Drizzle instances for all replica pools
      const replicaDbs = replicaPools.map((pool) =>
        drizzle(pool, {
          schema,
          casing: 'snake_case',
        }),
      );

      // Create region-aware replica selection strategy
      const createRegionStrategy = () => {
        const currentRegion = getRegion();

        if (currentRegion && config.replicaRegions.length > 0) {
          // Find region-matching replica
          const regionIndex = config.replicaRegions.findIndex(
            (region) => region.toLowerCase() === currentRegion.toLowerCase(),
          );

          if (regionIndex !== -1 && regionIndex < replicaDbs.length) {
            console.log(
              `Using replica ${regionIndex} for region ${currentRegion} (explicit mapping)`,
            );
            return replicaStrategies.regionBased(regionIndex);
          }
        }

        // Fallback to round-robin
        console.log(
          `Using round-robin replica selection${currentRegion ? ` (no match for region ${currentRegion})` : ''}`,
        );
        return replicaStrategies.roundRobin;
      };

      return withReplicas(
        primaryDb,
        replicaDbs as [typeof primaryDb, ...typeof replicaDbs],
        createRegionStrategy(),
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
