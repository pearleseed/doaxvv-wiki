/**
 * ContentCache
 * Manages cached content with simple key-value storage
 * Used to prevent redundant loading of content data
 */

export class ContentCache<T = any> {
  private cache: Map<string, T> = new Map();

  /**
   * Get a cached value by key
   * @param key - Cache key
   * @returns Cached value or undefined if not found
   */
  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to cache
   */
  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  /**
   * Check if a key exists in the cache
   * @param key - Cache key
   * @returns true if key exists, false otherwise
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Remove a specific key from the cache
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of cached items
   * @returns Number of items in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   * @returns Array of all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}
