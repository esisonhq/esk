import env from '../env';
import { DatabaseProvider } from '../types/db';
import { NeonProvider } from './neon';
import { PostgresProvider } from './postgres';
import { SupabaseProvider } from './supabase';

/**
 * Database provider detection and factory.
 *
 * Detects the database provider based on environment variables and returns
 * the appropriate provider instance.
 */
export const createDatabaseProvider = (): DatabaseProvider => {
  // Detect provider based on environment variables

  // Supabase
  if (env.DATABASE_PRIMARY_URL.includes('supabase')) {
    return new SupabaseProvider();
  }

  // Neon
  if (env.DATABASE_PRIMARY_URL.includes('neon')) {
    return new NeonProvider();
  }

  // Add more provider detection logic here
  // if (env.DATABASE_PRIMARY_URL.includes('planetscale')) {
  //   return new PlanetScaleProvider();
  // }

  // Railway
  if (env.DATABASE_PRIMARY_URL.includes('railway')) {
    return new PostgresProvider();
  }

  // Render
  if (env.DATABASE_PRIMARY_URL.includes('render')) {
    return new PostgresProvider();
  }

  // Default to generic PostgreSQL provider
  return new PostgresProvider();
};

// Export provider classes for direct usage if needed
export type { DatabaseProvider } from '../types/db';
export { NeonProvider } from './neon';
export { PostgresProvider } from './postgres';
export { SupabaseProvider } from './supabase';
