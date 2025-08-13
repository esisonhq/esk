import env from '../env';
import { DatabaseProvider } from '../types/db';

/**
 * Generic PostgreSQL provider for standard PostgreSQL instances.
 * Works with providers like localhost, Railway, Render, AWS RDS, etc.
 */
export class PostgresProvider implements DatabaseProvider {
  getPrimaryUrl() {
    return env.DATABASE_PRIMARY_URL;
  }

  getReplicaUrls() {
    return env.DATABASE_REPLICAS?.split(',').map((url) => url.trim()) || [];
  }

  getReplicaRegions() {
    return (
      env.DATABASE_REGIONS?.split(',').map((region) => region.trim()) || []
    );
  }

  getPoolConfig() {
    return {
      prepare: false,
      max: 15,
      idle_timeout: 60,
      connect_timeout: 10,
      ssl: env.NODE_ENV === 'production' ? ('require' as const) : false,
    };
  }

  /**
   * Get the replica index for a given region by matching region arrays.
   *
   * @param region - Current region
   * @returns Index of matching replica or -1 if none found
   */
  getReplicaIndexForRegion(region: string): number {
    const regions = this.getReplicaRegions();
    if (regions.length === 0) return -1;

    // Direct match first
    const directIndex = regions.findIndex(
      (r) => r.toLowerCase() === region.toLowerCase(),
    );
    if (directIndex !== -1) return directIndex;

    // Generic region aliases for various cloud providers
    const regionAliases: Record<string, string[]> = {
      'us-east': ['us-east-1', 'us-east-2', 'virginia', 'ohio'],
      'us-west': ['us-west-1', 'us-west-2', 'california', 'oregon'],
      'eu-west': ['eu-west-1', 'eu-west-2', 'ireland', 'london'],
      'eu-central': ['eu-central-1', 'frankfurt'],
      'ap-southeast': [
        'ap-southeast-1',
        'ap-southeast-2',
        'singapore',
        'sydney',
      ],
      europe: ['eu-west-1', 'eu-west-2', 'eu-central-1'],
      asia: ['ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1'],
    };

    // Try aliases
    for (const [alias, targets] of Object.entries(regionAliases)) {
      if (
        region.toLowerCase() === alias ||
        targets.includes(region.toLowerCase())
      ) {
        const aliasIndex = regions.findIndex(
          (r) => r.toLowerCase() === alias || targets.includes(r.toLowerCase()),
        );
        if (aliasIndex !== -1) return aliasIndex;
      }
    }

    return -1;
  }
}
