/**
 * useRecentSearches Hook
 * Manages recent search queries with localStorage persistence
 * 
 * Features:
 * - Stores searches in localStorage under 'doaxvv-recent-searches'
 * - Limits to maxItems (default 5)
 * - Prevents duplicates, maintains chronological order (newest first)
 * - Provides addSearch, removeSearch, clearSearches methods
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'doaxvv-recent-searches';
const DEFAULT_MAX_ITEMS = 5;

export interface UseRecentSearchesReturn {
  /** Array of recent search queries, newest first */
  searches: string[];
  /** Add a search query to the list */
  addSearch: (query: string) => void;
  /** Remove a specific search query from the list */
  removeSearch: (query: string) => void;
  /** Clear all recent searches */
  clearSearches: () => void;
}

/**
 * Parse recent searches from localStorage with validation
 */
function parseRecentSearches(stored: string | null): string[] {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string')
      .slice(0, DEFAULT_MAX_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Save searches to localStorage
 */
function saveToStorage(searches: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch (error) {
    // Handle quota exceeded or other storage errors
    console.warn('Failed to save recent searches to localStorage:', error);
  }
}


/**
 * Hook for managing recent search queries
 * 
 * @param maxItems - Maximum number of searches to store (default: 5)
 * @returns Object with searches array and methods to manage them
 * 
 * @example
 * ```tsx
 * const { searches, addSearch, removeSearch, clearSearches } = useRecentSearches();
 * 
 * // Add a search when user submits
 * const handleSearch = (query: string) => {
 *   addSearch(query);
 *   // ... perform search
 * };
 * 
 * // Display recent searches
 * {searches.map(search => (
 *   <button key={search} onClick={() => handleSearch(search)}>
 *     {search}
 *   </button>
 * ))}
 * ```
 */
export function useRecentSearches(maxItems: number = DEFAULT_MAX_ITEMS): UseRecentSearchesReturn {
  const [searches, setSearches] = useState<string[]>(() => {
    // Initialize from localStorage
    if (typeof window === 'undefined') return [];
    return parseRecentSearches(localStorage.getItem(STORAGE_KEY));
  });

  // Sync with localStorage on mount (handles SSR hydration)
  useEffect(() => {
    const stored = parseRecentSearches(localStorage.getItem(STORAGE_KEY));
    setSearches(stored);
  }, []);

  const addSearch = useCallback((query: string) => {
    // Trim and validate the query
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearches(prevSearches => {
      // Remove duplicate if exists (to move it to front)
      const filtered = prevSearches.filter(s => s !== trimmedQuery);
      
      // Add to front and limit to maxItems
      const newSearches = [trimmedQuery, ...filtered].slice(0, maxItems);
      
      // Persist to localStorage
      saveToStorage(newSearches);
      
      return newSearches;
    });
  }, [maxItems]);

  const removeSearch = useCallback((query: string) => {
    setSearches(prevSearches => {
      const newSearches = prevSearches.filter(s => s !== query);
      saveToStorage(newSearches);
      return newSearches;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear recent searches from localStorage:', error);
    }
  }, []);

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}

export default useRecentSearches;
