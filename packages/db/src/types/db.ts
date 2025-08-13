import postgres from 'postgres';

export interface DatabaseProvider {
  getPrimaryUrl(): string;
  getReplicaUrls(): string[];
  getReplicaRegions(): string[];
  getPoolConfig(): postgres.Options<Record<string, never>>;

  /**
   * Get the replica index for a given region.
   *
   * @param region - The current region
   * @returns The index of the best replica for the region, or -1 if none found
   */
  getReplicaIndexForRegion(region: string): number;
}
