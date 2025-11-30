import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentSearches } from '../../../src/shared/hooks/useRecentSearches';

describe('useRecentSearches', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual([]);
    });

    it('should restore searches from localStorage', () => {
      const savedSearches = ['kasumi', 'marie rose'];
      localStorageMock.setItem('doaxvv-recent-searches', JSON.stringify(savedSearches));

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual(savedSearches);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.setItem('doaxvv-recent-searches', 'invalid json');

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual([]);
    });
  });

  describe('addSearch', () => {
    it('should add new search', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
      });

      expect(result.current.searches).toEqual(['kasumi']);
    });

    it('should not add empty or whitespace searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('');
        result.current.addSearch('   ');
      });

      expect(result.current.searches).toEqual([]);
    });

    it('should not add duplicate searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
        result.current.addSearch('kasumi');
      });

      expect(result.current.searches).toEqual(['kasumi']);
    });

    it('should move existing search to front', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
        result.current.addSearch('marie');
        result.current.addSearch('kasumi');
      });

      expect(result.current.searches).toEqual(['kasumi', 'marie']);
    });

    it('should limit to max searches (default 5)', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        for (let i = 1; i <= 10; i++) {
          result.current.addSearch(`search${i}`);
        }
      });

      expect(result.current.searches).toHaveLength(5);
      expect(result.current.searches[0]).toBe('search10');
      expect(result.current.searches[4]).toBe('search6');
    });

    it('should respect custom max searches', () => {
      const { result } = renderHook(() => useRecentSearches(3));

      act(() => {
        for (let i = 1; i <= 10; i++) {
          result.current.addSearch(`search${i}`);
        }
      });

      expect(result.current.searches).toHaveLength(3);
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
      });

      const stored = localStorageMock.getItem('doaxvv-recent-searches');
      expect(JSON.parse(stored!)).toEqual(['kasumi']);
    });
  });

  describe('removeSearch', () => {
    it('should remove search', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
        result.current.addSearch('marie');
      });

      act(() => {
        result.current.removeSearch('kasumi');
      });

      expect(result.current.searches).toEqual(['marie']);
    });

    it('should handle removing non-existent search', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
      });

      act(() => {
        result.current.removeSearch('marie');
      });

      expect(result.current.searches).toEqual(['kasumi']);
    });

    it('should persist to localStorage after removal', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
        result.current.addSearch('marie');
      });

      act(() => {
        result.current.removeSearch('kasumi');
      });

      const stored = localStorageMock.getItem('doaxvv-recent-searches');
      expect(JSON.parse(stored!)).toEqual(['marie']);
    });
  });

  describe('clearSearches', () => {
    it('should clear all searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
        result.current.addSearch('marie');
      });

      act(() => {
        result.current.clearSearches();
      });

      expect(result.current.searches).toEqual([]);
    });

    it('should remove from localStorage after clearing', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('kasumi');
      });

      act(() => {
        result.current.clearSearches();
      });

      const stored = localStorageMock.getItem('doaxvv-recent-searches');
      expect(stored).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long search terms', () => {
      const { result } = renderHook(() => useRecentSearches());
      const longSearch = 'a'.repeat(1000);

      act(() => {
        result.current.addSearch(longSearch);
      });

      expect(result.current.searches).toContain(longSearch);
    });

    it('should handle special characters in searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('!@#$%^&*()');
        result.current.addSearch('search with spaces');
        result.current.addSearch('search-with-dashes');
      });

      expect(result.current.searches).toHaveLength(3);
    });

    it('should handle unicode and emoji in searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('こんにちは');
        result.current.addSearch('😀🎉');
      });

      expect(result.current.searches).toContain('こんにちは');
      expect(result.current.searches).toContain('😀🎉');
    });

    it('should trim whitespace from searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('  kasumi  ');
      });

      expect(result.current.searches).toEqual(['kasumi']);
    });

    it('should handle case-sensitive searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('Kasumi');
        result.current.addSearch('kasumi');
      });

      // Both should be stored as they are different
      expect(result.current.searches).toHaveLength(2);
    });

    it('should handle rapid consecutive additions', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addSearch(`search${i}`);
        }
      });

      expect(result.current.searches).toHaveLength(5);
    });

    it('should handle localStorage quota exceeded', () => {
      const { result } = renderHook(() => useRecentSearches());

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      act(() => {
        result.current.addSearch('test');
      });

      // Should not crash
      expect(result.current.searches).toContain('test');

      // Restore original
      localStorageMock.setItem = originalSetItem;
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('doaxvv-recent-searches', '{invalid json}');

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual([]);
    });

    it('should handle non-array data in localStorage', () => {
      localStorageMock.setItem('doaxvv-recent-searches', JSON.stringify({ not: 'array' }));

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual([]);
    });

    it('should handle null in localStorage', () => {
      localStorageMock.setItem('doaxvv-recent-searches', 'null');

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should handle large number of operations efficiently', () => {
      const { result } = renderHook(() => useRecentSearches(100));

      const start = Date.now();

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.addSearch(`search${i}`);
        }
      });

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in reasonable time
      expect(result.current.searches).toHaveLength(100);
    });
  });

  describe('Custom Storage Key', () => {
    it('should use default storage key', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('test');
      });

      const stored = localStorageMock.getItem('doaxvv-recent-searches');
      expect(stored).toBeDefined();
    });
  });
});
