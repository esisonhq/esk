import { env } from '@esk/utils/env';

import type { ConnectionConfig, DatabaseConfig } from '../config';
import { PROVIDER_DEFAULTS, getCurrentRegion } from '../config';

/**
 * Detects the database provider from a URL using the provider patterns.
 *
 * @param url - Database connection string
 * @param providers - Provider configuration object
 * @returns The matched provider key or 'default'
 */
function detectProviderFromUrl(
  url: string,
  providers: typeof PROVIDER_DEFAULTS,
): keyof typeof PROVIDER_DEFAULTS {
  for (const [providerName, config] of Object.entries(providers)) {
    if (providerName === 'default') continue; // Skip default, it's our fallback

    const matched = config.urlPatterns.some((pattern) =>
      url.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (matched) {
      return providerName;
    }
  }

  return 'default';
}

/**
 * Creates a connection configuration using provider-specific defaults.
 *
 * @param url - Database connection string
 * @param providers - Provider configuration object
 * @returns Complete ConnectionConfig object
 */
function createConnectionConfig(
  url: string,
  providers: typeof PROVIDER_DEFAULTS,
): ConnectionConfig {
  const providerKey = detectProviderFromUrl(url, providers);
  const provider = providers[providerKey]!;

  // Extract pool config (exclude urlPatterns)
  const { urlPatterns: _, ...poolConfig } = provider;

  return {
    url,
    poolConfig,
  };
}

/**
 * Constructs the full database configuration from environment and providers.
 *
 * @param env - Environment variables object
 * @param providers - Provider configuration object
 * @returns Complete DatabaseConfig object
 */
function buildDatabaseConfig(
  env: {
    DATABASE_URL: string;
    DATABASE_REPLICAS?: string;
    DATABASE_REGIONS?: string;
  },
  providers: typeof PROVIDER_DEFAULTS,
): DatabaseConfig {
  const primary = createConnectionConfig(env.DATABASE_URL, providers);

  const replicaUrls = env.DATABASE_REPLICAS
    ? env.DATABASE_REPLICAS.split(',')
        .map((url) => url.trim())
        .filter(Boolean)
    : [];

  const replicaRegions = env.DATABASE_REGIONS
    ? env.DATABASE_REGIONS.split(',')
        .map((region) => region.trim())
        .filter(Boolean)
    : [];

  const replicas = replicaUrls.map((url) =>
    createConnectionConfig(url, providers),
  );

  // Logging for debugging
  const primaryProvider = detectProviderFromUrl(primary.url, providers);
  console.log(
    `Database config: Primary (${primaryProvider}), Replicas: ${replicas.length}`,
  );

  replicas.forEach((replica, index) => {
    const replicaProvider = detectProviderFromUrl(replica.url, providers);
    const region = replicaRegions[index] ? ` in ${replicaRegions[index]}` : '';
    console.log(`  Replica ${index}: ${replicaProvider}${region}`);
  });

  return {
    primary,
    replicas,
    replicaRegions,
  };
}

/**
 * Gets the complete database configuration using the user-defined providers.
 *
 * This function bridges the user configuration with the actual database setup.
 * It uses the PROVIDER_DEFAULTS and getCurrentRegion from config.ts.
 */
export function getDatabaseConfig() {
  return buildDatabaseConfig(env, PROVIDER_DEFAULTS);
}

/**
 * Gets the current region using the user-defined detection function.
 */
export function getRegion() {
  return getCurrentRegion();
}
