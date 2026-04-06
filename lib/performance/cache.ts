/**
 * Client-side caching utilities
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Remove item from cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Clear expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.clearExpired();
  }, 5 * 60 * 1000);
}

/**
 * Cache keys for common data
 */
export const CACHE_KEYS = {
  WORKOUT_PROGRAMS: 'workout_programs',
  USER_PROFILE: (userId: string) => `profile_${userId}`,
  PROTEIN_LOGS: (userId: string, date: string) => `protein_${userId}_${date}`,
  WORKOUT_SESSIONS: (userId: string) => `workouts_${userId}`,
  PROGRESS_PHOTOS: (userId: string) => `photos_${userId}`,
};

/**
 * Cache TTLs (in milliseconds)
 */
export const CACHE_TTL = {
  WORKOUT_PROGRAMS: 60 * 60 * 1000, // 1 hour (rarely changes)
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes
  PROTEIN_LOGS: 2 * 60 * 1000, // 2 minutes
  WORKOUT_SESSIONS: 5 * 60 * 1000, // 5 minutes
  PROGRESS_PHOTOS: 15 * 60 * 1000, // 15 minutes
};

