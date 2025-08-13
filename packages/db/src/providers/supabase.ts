import env from '../env';
import { DatabaseProvider } from '../types/db';

export class SupabaseProvider implements DatabaseProvider {
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
      max: 20,
      idle_timeout: 20,
      connect_timeout: 10,
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

    // Supabase/Fly.io region aliases
    const regionAliases: Record<string, string[]> = {
      europe: ['fra', 'frankfurt'],
      'us-east': ['iad', 'washington', 'virginia'],
      'us-west': ['sjc', 'san-jose', 'california'],
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
