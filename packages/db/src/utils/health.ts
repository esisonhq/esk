import { sql } from 'drizzle-orm';

import type { Database } from '../client';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  error?: string;
  latency?: number;
  details?: Record<string, unknown>;
}

export interface ReplicationLagResult {
  lagMs: number;
  lagBytes: number;
  isHealthy: boolean;
  timestamp: Date;
}

export interface ConnectionPoolHealth {
  totalConnections: number;
  idleConnections: number;
  waitingConnections: number;
  isHealthy: boolean;
}

/**
 * Basic database health check using a simple SELECT query.
 *
 * @param db - Database instance to check
 * @returns Health check result with status and timing information
 */
export const checkDatabaseHealth = async (
  db: Database,
): Promise<HealthCheckResult> => {
  const startTime = Date.now();

  try {
    await db.execute(sql`SELECT 1 as health_check`);
    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      timestamp: new Date(),
      latency,
      details: {
        query: 'SELECT 1 as health_check',
        responseTime: `${latency}ms`,
      },
    };
  } catch (error) {
    const latency = Date.now() - startTime;

    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
      latency,
      details: {
        query: 'SELECT 1 as health_check',
        responseTime: `${latency}ms`,
      },
    };
  }
};

/**
 * Advanced health check that includes database version and statistics.
 *
 * @param db - Database instance to check
 * @returns Detailed health check result
 */
export const checkDatabaseHealthDetailed = async (
  db: Database,
): Promise<HealthCheckResult> => {
  const startTime = Date.now();

  try {
    // Check basic connectivity and get database info
    const [basicCheck, versionCheck, statsCheck] = await Promise.allSettled([
      db.execute(sql`SELECT 1 as health_check`),
      db.execute(sql`SELECT version() as version`),
      db.execute(sql`
        SELECT 
          pg_database_size(current_database()) as db_size,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
          now() as server_time
      `),
    ]);

    const latency = Date.now() - startTime;

    // Extract results with proper typing
    const version =
      versionCheck.status === 'fulfilled'
        ? ((Array.from(versionCheck.value)[0] as Record<string, unknown>)
            ?.version as string)
        : 'unknown';

    const stats =
      statsCheck.status === 'fulfilled'
        ? (Array.from(statsCheck.value)[0] as Record<string, unknown>)
        : {};

    // Determine health status
    let status: 'healthy' | 'degraded' = 'healthy';
    if (latency > 1000) status = 'degraded'; // Slow response
    if (basicCheck.status === 'rejected') status = 'degraded';

    return {
      status,
      timestamp: new Date(),
      latency,
      details: {
        version: version?.substring(0, 50) || 'unknown',
        databaseSize: stats.db_size
          ? `${Math.round(Number(stats.db_size) / 1024 / 1024)}MB`
          : 'unknown',
        activeConnections: stats.active_connections
          ? String(stats.active_connections)
          : 'unknown',
        serverTime: stats.server_time ? String(stats.server_time) : 'unknown',
        checksCompleted: {
          basic: basicCheck.status === 'fulfilled',
          version: versionCheck.status === 'fulfilled',
          stats: statsCheck.status === 'fulfilled',
        },
      },
    };
  } catch (error) {
    const latency = Date.now() - startTime;

    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
      latency,
    };
  }
};

/**
 * Check replication lag between primary and replica databases.
 *
 * @param primary - Primary database instance
 * @param replica - Replica database instance
 * @returns Replication lag information
 */
export const checkReplicationLag = async (
  primary: Database,
  replica: Database,
): Promise<ReplicationLagResult> => {
  try {
    // Get WAL position from primary
    const primaryResult = await primary.execute(sql`
      SELECT pg_current_wal_lsn() as wal_lsn, extract(epoch from now()) as timestamp
    `);

    // Get WAL replay position from replica
    const replicaResult = await replica.execute(sql`
      SELECT 
        pg_last_wal_replay_lsn() as replay_lsn,
        extract(epoch from now()) as timestamp,
        pg_is_in_recovery() as in_recovery
    `);

    const primaryData = Array.from(primaryResult)[0] as Record<string, unknown>;
    const replicaData = Array.from(replicaResult)[0] as Record<string, unknown>;

    // Calculate lag in bytes (simplified)
    const primaryLsn = primaryData.wal_lsn as string;
    const replicaLsn = replicaData.replay_lsn as string;

    const lagBytes =
      primaryLsn && replicaLsn
        ? Math.abs(
            parseInt(primaryLsn.replace('/', ''), 16) -
              parseInt(replicaLsn.replace('/', ''), 16),
          )
        : 0;

    // Calculate time lag
    const primaryTime = Number(primaryData.timestamp);
    const replicaTime = Number(replicaData.timestamp);
    const lagMs = Math.abs((primaryTime - replicaTime) * 1000);

    return {
      lagMs,
      lagBytes,
      isHealthy: lagMs < 5000 && lagBytes < 1024 * 1024, // < 5s and < 1MB lag
      timestamp: new Date(),
    };
  } catch {
    return {
      lagMs: -1,
      lagBytes: -1,
      isHealthy: false,
      timestamp: new Date(),
    };
  }
};
