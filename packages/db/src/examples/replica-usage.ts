/**
 * Example usage of replicas.ts.
 *
 * This file demonstrates the enhanced type safety and functionality
 * of the rewritten replica routing system.
 */

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  getPrimaryDatabase,
  isReplicatedDatabase,
  replicaStrategies,
  withReplicas,
} from '../replicas';
import * as schema from '../schemas';

// Example: Basic replica setup
async function basicReplicaExample() {
  // Create database connections
  const primaryPool = postgres('postgresql://primary:5432/db');
  const replicaPool1 = postgres('postgresql://replica1:5432/db');
  const replicaPool2 = postgres('postgresql://replica2:5432/db');

  // Create Drizzle instances
  const primaryDb = drizzle(primaryPool, { schema, casing: 'snake_case' });
  const replicaDb1 = drizzle(replicaPool1, { schema, casing: 'snake_case' });
  const replicaDb2 = drizzle(replicaPool2, { schema, casing: 'snake_case' });

  // Create replicated database with default random selection
  const db = withReplicas(primaryDb, [replicaDb1, replicaDb2]);

  // Read operations automatically use replicas
  const users = await db.select().from(schema.taskTable);
  console.log('Read from replica:', users);

  // Write operations automatically use primary
  const newTask = await db
    .insert(schema.taskTable)
    .values({
      name: 'New Task',
      done: false,
    })
    .returning();
  console.log('Written to primary:', newTask);

  // Use replica-specific methods
  const count = await db.executeOnReplica(sql`SELECT COUNT(*) FROM tasks`);
  console.log('Count from replica:', count);

  // Force primary for read-after-write consistency
  const freshData = await db.usePrimaryOnly().select().from(schema.taskTable);
  console.log('Fresh data from primary:', freshData);
}

// Example: Custom replica selection strategy
async function customStrategyExample() {
  const primaryDb = drizzle(postgres('postgresql://primary:5432/db'), {
    schema,
  });
  const replicaDb1 = drizzle(postgres('postgresql://replica1:5432/db'), {
    schema,
  });
  const replicaDb2 = drizzle(postgres('postgresql://replica2:5432/db'), {
    schema,
  });

  // Use region-based selection
  const db = withReplicas(
    primaryDb,
    [replicaDb1, replicaDb2],
    replicaStrategies.regionBased(0), // Always use first replica
  );

  // Alternative: Use round-robin strategy
  const dbRoundRobin = withReplicas(
    primaryDb,
    [replicaDb1, replicaDb2],
    replicaStrategies.roundRobin,
  );

  return { db, dbRoundRobin };
}

// Example: Type guards and utilities
async function utilityExample() {
  const primaryDb = drizzle(postgres('postgresql://primary:5432/db'), {
    schema,
  });
  const replicaDb = drizzle(postgres('postgresql://replica:5432/db'), {
    schema,
  });

  const db = withReplicas(primaryDb, [replicaDb]);

  // Type guard usage
  if (isReplicatedDatabase(db)) {
    console.log('This is a replicated database');

    // Access primary directly
    const primary = db.$primary;
    console.log('Primary database:', primary);

    // Switch to primary-only mode
    const primaryOnly = db.usePrimaryOnly();
    console.log('Primary-only mode:', primaryOnly);
  }

  // Extract primary from any database type
  const extractedPrimary = getPrimaryDatabase(db);
  console.log('Extracted primary:', extractedPrimary);
}

// Example: Transaction handling
async function transactionExample() {
  const primaryDb = drizzle(postgres('postgresql://primary:5432/db'), {
    schema,
  });
  const replicaDb = drizzle(postgres('postgresql://replica:5432/db'), {
    schema,
  });

  const db = withReplicas(primaryDb, [replicaDb]);

  // Regular transaction (uses primary)
  await db.transaction(async (tx) => {
    await tx.insert(schema.taskTable).values({ name: 'Task 1', done: false });
    await tx.insert(schema.taskTable).values({ name: 'Task 2', done: false });
  });

  // Replica transaction for read-only operations
  const results = await db.transactionOnReplica(async (tx) => {
    return tx.select().from(schema.taskTable);
  });

  console.log('Transaction results from replica:', results);
}

export {
  basicReplicaExample,
  customStrategyExample,
  transactionExample,
  utilityExample,
};
