import postgres from 'postgres';

import { env } from '@esk/utils/env';

/**
 * Get provider-specific pool configuration based on database URL.
 */
export const getPoolConfigForUrl = (
  url: string,
): postgres.Options<Record<string, never>> => {
  if (url.includes('supabase')) {
    return {
      prepare: false,
      ssl: 'require' as const,
      max: 10,
      idle_timeout: 60,
      connect_timeout: 5,
    };
  }

  if (url.includes('neon')) {
    return {
      prepare: false,
      ssl: 'require' as const,
      max: 10,
      idle_timeout: 60,
      connect_timeout: 5,
    };
  }

  if (url.includes('planetscale')) {
    return {
      prepare: false,
      ssl: 'require' as const,
      max: 10,
      idle_timeout: 60,
      connect_timeout: 5,
    };
  }

  if (url.includes('railway')) {
    return {
      prepare: false,
      ssl: 'require' as const,
      max: 10,
      idle_timeout: 60,
      connect_timeout: 5,
    };
  }

  if (url.includes('render')) {
    return {
      prepare: false,
      ssl: 'require' as const,
      max: 10,
      idle_timeout: 60,
      connect_timeout: 5,
    };
  }

  // Default PostgreSQL config
  return {
    prepare: false,
    max: 10,
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: env.NODE_ENV === 'production' ? ('require' as const) : false,
  };
};

/**
 * Get all replica URLs from environment.
 */
export const getReplicaUrls = (): string[] => {
  return env.DATABASE_REPLICAS?.split(',').map((url) => url.trim()) || [];
};

/**
 * Get all replica regions from environment.
 */
export const getReplicaRegions = (): string[] => {
  return env.DATABASE_REGIONS?.split(',').map((region) => region.trim()) || [];
};
