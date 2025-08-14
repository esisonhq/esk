import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type { TablesRelationalConfig } from 'drizzle-orm/relations';

/**
 * Database routing strategy for replica selection.
 */
export type ReplicaSelectionStrategy<
  Q extends PgDatabase<
    PgQueryResultHKT,
    Record<string, unknown>,
    TablesRelationalConfig
  >,
> = (replicas: Q[]) => Q;

/**
 * A database wrapper that supports read replicas with proper type safety.
 *
 * @template Q - A Drizzle PostgreSQL database type
 *
 * @property executeOnReplica - Executes a query on the selected replica
 * @property transactionOnReplica - Runs a transaction on the selected replica
 * @property usePrimaryOnly - Returns a version of the database that routes all operations to the primary
 * @property $primary - Direct access to the primary database instance
 */
export type ReplicatedDatabase<
  Q extends PgDatabase<
    PgQueryResultHKT,
    Record<string, unknown>,
    TablesRelationalConfig
  >,
> = Q & {
  executeOnReplica: Q['execute'];
  transactionOnReplica: Q['transaction'];
  usePrimaryOnly: () => ReplicatedDatabase<Q>;
  $primary: Q;
};

/**
 * Wraps a primary Drizzle database instance with read replicas using proper type safety.
 *
 * This implementation uses a simpler approach that preserves all original method signatures
 * while providing replica routing capabilities.
 *
 * @template HKT - Query result type
 * @template TFullSchema - Full schema definition
 * @template TSchema - Relational schema config
 * @template Q - Drizzle PostgreSQL database type
 *
 * @param primary - The primary database instance for writes
 * @param replicas - An array of replica database instances for reads (must have at least one)
 * @param getReplica - Optional function to select a replica (defaults to random selection)
 *
 * @returns A `ReplicatedDatabase` that routes:
 * - Read operations (select, count, etc.) to a selected replica
 * - Write operations (insert, update, delete) to the primary
 * - Allows switching to primary-only mode for consistency requirements
 *
 * @example
 * ```typescript
 * const db = withReplicas(primaryDb, [replica1, replica2]);
 *
 * // Reads use replicas automatically
 * const users = await db.select().from(usersTable);
 *
 * // Writes use primary automatically
 * const inserted = await db.insert(usersTable).values({...}).returning();
 *
 * // Force primary for read-after-write consistency
 * const freshData = await db.usePrimaryOnly().select().from(usersTable);
 * ```
 */
export const withReplicas = <
  HKT extends PgQueryResultHKT,
  TFullSchema extends Record<string, unknown>,
  TSchema extends TablesRelationalConfig,
  Q extends PgDatabase<
    HKT,
    TFullSchema,
    TSchema extends Record<string, unknown>
      ? ExtractTablesWithRelations<TFullSchema>
      : TSchema
  >,
>(
  primary: Q,
  replicas: [Q, ...Q[]],
  getReplica: ReplicaSelectionStrategy<Q> = (replicaList) =>
    replicaList[Math.floor(Math.random() * replicaList.length)]!,
): ReplicatedDatabase<Q> => {
  /**
   * Internal factory to create a replicated database instance.
   *
   * @param usePrimary - If true, all operations are routed to the primary
   * @returns A `ReplicatedDatabase` with proper routing logic
   */
  const createDatabase = (usePrimary = false): ReplicatedDatabase<Q> => {
    const getDbForRead = (): Q => (usePrimary ? primary : getReplica(replicas));

    // Create a proxy-like object that delegates calls appropriately
    const replicatedDb = Object.create(primary) as ReplicatedDatabase<Q>;

    // Copy all properties from primary
    Object.assign(replicatedDb, primary);

    // Override read operations to use replicas
    replicatedDb.select = getDbForRead().select.bind(getDbForRead());
    replicatedDb.selectDistinct =
      getDbForRead().selectDistinct.bind(getDbForRead());
    replicatedDb.selectDistinctOn =
      getDbForRead().selectDistinctOn.bind(getDbForRead());
    replicatedDb.$count = getDbForRead().$count.bind(getDbForRead());
    replicatedDb.with = getDbForRead().with.bind(getDbForRead());
    replicatedDb.$with = getDbForRead().$with.bind(getDbForRead());

    // Write operations always use primary (already bound correctly via Object.assign)
    replicatedDb.update = primary.update.bind(primary);
    replicatedDb.insert = primary.insert.bind(primary);
    replicatedDb.delete = primary.delete.bind(primary);
    replicatedDb.execute = primary.execute.bind(primary);
    replicatedDb.transaction = primary.transaction.bind(primary);
    replicatedDb.refreshMaterializedView =
      primary.refreshMaterializedView?.bind(primary);

    // Add replica-specific methods
    replicatedDb.executeOnReplica = getDbForRead().execute.bind(getDbForRead());
    replicatedDb.transactionOnReplica =
      getDbForRead().transaction.bind(getDbForRead());

    // Add utility methods
    replicatedDb.usePrimaryOnly = (): ReplicatedDatabase<Q> =>
      createDatabase(true);
    replicatedDb.$primary = primary;

    // Dynamic query property that respects routing
    Object.defineProperty(replicatedDb, 'query', {
      get() {
        return getDbForRead().query;
      },
      enumerable: true,
      configurable: true,
    });

    return replicatedDb;
  };

  return createDatabase(false);
};

/**
 * Common replica selection strategies.
 */
export const replicaStrategies = {
  /**
   * Random selection strategy (default).
   */
  random: <
    Q extends PgDatabase<
      PgQueryResultHKT,
      Record<string, unknown>,
      TablesRelationalConfig
    >,
  >(
    replicas: Q[],
  ): Q => replicas[Math.floor(Math.random() * replicas.length)]!,

  /**
   * Round-robin selection strategy based on timestamp.
   */
  roundRobin: <
    Q extends PgDatabase<
      PgQueryResultHKT,
      Record<string, unknown>,
      TablesRelationalConfig
    >,
  >(
    replicas: Q[],
  ): Q => replicas[Math.floor(Date.now() / 1000) % replicas.length]!,

  /**
   * First available replica strategy.
   */
  firstAvailable: <
    Q extends PgDatabase<
      PgQueryResultHKT,
      Record<string, unknown>,
      TablesRelationalConfig
    >,
  >(
    replicas: Q[],
  ): Q => replicas[0]!,

  /**
   * Create a region-based selection strategy.
   */
  regionBased:
    <
      Q extends PgDatabase<
        PgQueryResultHKT,
        Record<string, unknown>,
        TablesRelationalConfig
      >,
    >(
      preferredIndex: number,
    ) =>
    (replicas: Q[]): Q => {
      return replicas[preferredIndex] || replicas[0]!;
    },
} as const;

/**
 * Type guard to check if a database instance is a replicated database.
 */
export const isReplicatedDatabase = <
  Q extends PgDatabase<
    PgQueryResultHKT,
    Record<string, unknown>,
    TablesRelationalConfig
  >,
>(
  db: Q | ReplicatedDatabase<Q>,
): db is ReplicatedDatabase<Q> => {
  return (
    '$primary' in db &&
    typeof (db as ReplicatedDatabase<Q>).usePrimaryOnly === 'function'
  );
};

/**
 * Utility to extract the primary database from a replicated database.
 */
export const getPrimaryDatabase = <
  Q extends PgDatabase<
    PgQueryResultHKT,
    Record<string, unknown>,
    TablesRelationalConfig
  >,
>(
  db: Q | ReplicatedDatabase<Q>,
): Q => {
  return isReplicatedDatabase(db) ? db.$primary : db;
};
