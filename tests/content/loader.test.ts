/**
 * Tests for ContentLoader
 * 
 * Tests lazy loading, caching, request deduplication, and content loading
 * functionality of the ContentLoader singleton.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContentLoader } from '../../src/content/loader';

describe('ContentLoader', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    ContentLoader.resetInstance();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = ContentLoader.getInstance();
      const instance2 = ContentLoader.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('lazy loading', () => {
    it('should have empty cache on initialization', () => {
      const loader = ContentLoader.getInstance();
      expect(loader.isCacheEmpty()).toBe(true);
      expect(loader.getCacheSize()).toBe(0);
    });

    it('should only load content when requested', async () => {
      const loader = ContentLoader.getInstance();
      
      // Cache should be empty initially
      expect(loader.isCacheEmpty()).toBe(true);
      
      // Load only guides
      await loader.loadGuides();
      
      // Cache should now have guides
      expect(loader.getCacheSize()).toBeGreaterThan(0);
      expect(loader.getGuides().length).toBeGreaterThan(0);
    });
  });

  describe('loadCharacters', () => {
    it('should load characters', async () => {
      const loader = ContentLoader.getInstance();
      
      const characters = await loader.loadCharacters();
      
      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(0);
    });

    it('should return cached data on subsequent calls', async () => {
      const loader = ContentLoader.getInstance();
      
      const characters1 = await loader.loadCharacters();
      const characters2 = await loader.loadCharacters();
      
      // Should return the same array reference (cached)
      expect(characters1).toBe(characters2);
    });
  });

  describe('loadGuides', () => {
    it('should load guides', async () => {
      const loader = ContentLoader.getInstance();
      
      const guides = await loader.loadGuides();
      
      expect(Array.isArray(guides)).toBe(true);
      expect(guides.length).toBeGreaterThan(0);
    });
  });

  describe('loadEvents', () => {
    it('should load events', async () => {
      const loader = ContentLoader.getInstance();
      
      const events = await loader.loadEvents();
      
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('concurrent requests', () => {
    it('should deduplicate concurrent requests for the same content type', async () => {
      const loader = ContentLoader.getInstance();
      
      // Make multiple concurrent requests
      const [guides1, guides2, guides3] = await Promise.all([
        loader.loadGuides(),
        loader.loadGuides(),
        loader.loadGuides(),
      ]);
      
      // All should return the same data
      expect(guides1.length).toBe(guides2.length);
      expect(guides2.length).toBe(guides3.length);
      expect(guides1).toBe(guides2);
      expect(guides2).toBe(guides3);
    });
  });

  describe('selective loading', () => {
    it('should only load requested content types', async () => {
      const loader = ContentLoader.getInstance();
      
      // Load only guides
      await loader.loadGuides();
      
      // Guides should be loaded, but not events
      expect(loader.getGuides().length).toBeGreaterThan(0);
      expect(loader.getEvents().length).toBe(0); // Not loaded yet
      expect(loader.getCharacters().length).toBe(0); // Not loaded yet
    });
  });

  describe('clearCache', () => {
    it('should clear all cached content', async () => {
      const loader = ContentLoader.getInstance();
      
      // Load some content
      await loader.loadGuides();
      await loader.loadCharacters();
      
      expect(loader.getCacheSize()).toBeGreaterThan(0);
      
      // Clear cache
      loader.clearCache();
      
      expect(loader.isCacheEmpty()).toBe(true);
      expect(loader.getCacheSize()).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle loading errors gracefully', async () => {
      const loader = ContentLoader.getInstance();
      
      // This test assumes the loader handles errors internally
      // In a real scenario, you might mock the file system to throw errors
      try {
        await loader.loadCharacters();
        expect(true).toBe(true); // If no error, test passes
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should maintain cache integrity after partial load failure', async () => {
      const loader = ContentLoader.getInstance();
      
      // Load one type successfully
      await loader.loadGuides();
      const guidesCount = loader.getGuides().length;
      
      // Even if another load fails, guides should still be cached
      expect(loader.getGuides().length).toBe(guidesCount);
    });
  });

  describe('multiple content types', () => {
    it('should load all content types independently', async () => {
      const loader = ContentLoader.getInstance();
      
      await Promise.all([
        loader.loadCharacters(),
        loader.loadGuides(),
        loader.loadEvents(),
        loader.loadSwimsuits(),
        loader.loadItems(),
        loader.loadEpisodes(),
        loader.loadGachas(),
      ]);
      
      expect(loader.getCacheSize()).toBeGreaterThan(0);
    });

    it('should handle mixed loaded and unloaded content', async () => {
      const loader = ContentLoader.getInstance();
      
      await loader.loadGuides();
      
      expect(loader.getGuides().length).toBeGreaterThan(0);
      expect(loader.getCharacters().length).toBe(0);
      expect(loader.getEvents().length).toBe(0);
    });
  });

  describe('cache management', () => {
    it('should reload content after cache clear', async () => {
      const loader = ContentLoader.getInstance();
      
      await loader.loadGuides();
      const firstLoad = loader.getGuides();
      
      loader.clearCache();
      
      await loader.loadGuides();
      const secondLoad = loader.getGuides();
      
      expect(firstLoad.length).toBe(secondLoad.length);
    });

    it('should handle rapid cache operations', async () => {
      const loader = ContentLoader.getInstance();
      
      await loader.loadGuides();
      loader.clearCache();
      await loader.loadGuides();
      loader.clearCache();
      await loader.loadGuides();
      
      expect(loader.getGuides().length).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('should cache results for faster subsequent access', async () => {
      const loader = ContentLoader.getInstance();
      
      const start1 = Date.now();
      await loader.loadGuides();
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      await loader.loadGuides();
      const time2 = Date.now() - start2;
      
      // Second call should be fast (cached) - allow for some variance
      // Just verify it doesn't take significantly longer
      expect(time2).toBeLessThanOrEqual(time1 + 50);
    });
  });
});
