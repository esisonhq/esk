/**
 * In-memory cache for tracking recent mutations per key.
 * Used to determine when to use primary DB for read-after-write consistency.
 */

interface CacheEntry {
  timestamp: number;
  expiresAt: number;
}

class ReplicationCache {
  private cache = new Map<string, CacheEntry>();
  private readonly ttl: number;

  constructor(ttlMs: number = 5000) {
    // 5 seconds default
    this.ttl = ttlMs;
  }

  /**
   * Mark that a mutation occurred for the given key.
   * Subsequent reads should use primary DB until TTL expires.
   */
  set(key: string): void {
    const now = Date.now();
    this.cache.set(key, {
      timestamp: now,
      expiresAt: now + this.ttl,
    });
  }

  /**
   * Check if a recent mutation occurred for the given key.
   * Returns the expiration timestamp if found and not expired.
   */
  get(key: string): number | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();

    // If expired, clean up and return null
    if (now >= entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.expiresAt;
  }

  /**
   * Clear all expired entries (cleanup)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size (for monitoring)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const replicationCache = new ReplicationCache();

// Optional: Periodic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    replicationCache.cleanup();
  }, 30000); // Cleanup every 30 seconds
}
