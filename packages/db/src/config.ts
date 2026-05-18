import postgres from 'postgres';

export interface PoolConfig extends postgres.Options<Record<string, never>> {
  max?: number;
  idle_timeout?: number;
  connect_timeout?: number;
  ssl?: boolean | 'require' | 'prefer';
  prepare?: boolean;
}

export interface ProviderConfig extends Partial<PoolConfig> {
  urlPatterns: string[];
}

export interface ConnectionConfig {
  url: string;
  poolConfig: PoolConfig;
}

export interface DatabaseConfig {
  primary: ConnectionConfig;
  replicas: ConnectionConfig[];
  replicaRegions: string[];
}

/**
 * Provider configurations with URL pattern matching.
 *
 * This is the **main configuration object** that end users should customize.
 * Each provider includes both connection pool settings and URL patterns for auto-detection.
 *
 * To add a new provider or modify existing ones, simply update this object:
 *
 * @example
 * ```ts
 * export const PROVIDER_DEFAULTS = {
 *   myCustomProvider: {
 *     urlPatterns: ['myservice.com', 'custom-db.net'],
 *     max: 15,
 *     ssl: 'require' as const,
 *     prepare: true,
 *   },
 *   // ... existing providers
 * };
 * ```
 */
export const PROVIDER_DEFAULTS: Record<string, ProviderConfig> = {
  supabase: {
    urlPatterns: ['supabase.co', 'supabase.com'],
    max: 10,
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: 'require' as const,
    prepare: false,
  },
  neon: {
    urlPatterns: ['neon.tech', 'neon.db'],
    max: 5, // Neon has connection pooling, lower max is better
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: 'require' as const,
    prepare: false,
  },
  planetscale: {
    urlPatterns: ['planetscale.com', 'psdb.cloud'],
    max: 10,
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: 'require' as const,
    prepare: false,
  },
  railway: {
    urlPatterns: ['railway.app', 'railwayapp.com'],
    max: 10,
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: 'require' as const,
    prepare: false,
  },
  render: {
    urlPatterns: ['render.com'],
    max: 10,
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: 'require' as const,
    prepare: false,
  },
  aws: {
    urlPatterns: ['rds.amazonaws.com', 'amazonaws.com'],
    max: 20, // AWS RDS can handle more connections
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: 'require' as const,
    prepare: true, // AWS RDS supports prepared statements well
  },
  local: {
    urlPatterns: ['localhost', '127.0.0.1', '0.0.0.0'],
    max: 5,
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: false,
    prepare: true,
  },

  // Default fallback (must be last, no urlPatterns needed)
  default: {
    urlPatterns: [],
    max: 10,
    idle_timeout: 60,
    connect_timeout: 5,
    ssl: 'require' as const,
    prepare: false,
  },
} as const;

/**
 * Detects the current region of the running environment.
 *
 * This function should be **customized by the end user** to return the
 * appropriate region identifier based on their infrastructure.
 *
 * @returns {string | null} The current region, or `null` if not detected.
 */
export const getCurrentRegion = (): string | null => {
  /* eslint-disable turbo/no-undeclared-env-vars */
  return (
    process.env.FLY_REGION ||
    process.env.FLY_PRIMARY_REGION ||
    process.env.RENDER_SERVICE_REGION ||
    process.env.NEON_REGION ||
    process.env.PLANETSCALE_REGION ||
    process.env.RAILWAY_REGION ||
    process.env.VERCEL_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    null
  );
  /* eslint-enable turbo/no-undeclared-env-vars */
};
