/**
 * RequestDeduplicator
 * Prevents duplicate concurrent requests for the same resource
 * by storing pending promises and reusing them across multiple callers
 */

export class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Execute a request or return the pending promise if one exists for the given key
   * @param key - Unique identifier for the request
   * @param factory - Function that creates the promise to execute
   * @returns Promise that resolves with the result
   */
  async dedupe<R>(key: string, factory: () => Promise<R>): Promise<R> {
    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<R>;
    }

    // Create new request
    const promise = factory()
      .then((result) => {
        // Clean up after successful completion
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        // Clean up after error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store the pending promise
    this.pendingRequests.set(key, promise);

    return promise;
  }

  /**
   * Check if a request is currently pending for the given key
   * @param key - Unique identifier for the request
   * @returns true if request is pending, false otherwise
   */
  isPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  /**
   * Clear a pending request (useful for error recovery)
   * @param key - Unique identifier for the request to clear
   */
  clear(key: string): void {
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.pendingRequests.clear();
  }
}
