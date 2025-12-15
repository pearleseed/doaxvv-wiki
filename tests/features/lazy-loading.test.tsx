import React, { Suspense, lazy } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/shared/components/ThemeProvider';

// Create a fresh QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// Loading fallback component (same as in App.tsx)
const LoadingFallback = () => (
  <div data-testid="loading-fallback" className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Test wrapper with all required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Lazy Loading Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Suspense Fallback', () => {
    it('should display loading fallback while lazy component loads', async () => {
      // Create a lazy component that delays loading
      const DelayedComponent = lazy(
        () =>
          new Promise<{ default: React.ComponentType }>((resolve) => {
            setTimeout(() => {
              resolve({ default: () => <div data-testid="loaded-content">Loaded!</div> });
            }, 100);
          })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/test']}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/test" element={<DelayedComponent />} />
              </Routes>
            </Suspense>
          </MemoryRouter>
        </TestWrapper>
      );

      // Should show loading fallback initially
      expect(screen.getByTestId('loading-fallback')).toBeInTheDocument();

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId('loaded-content')).toBeInTheDocument();
      }, { timeout: 500 });

      // Loading fallback should be gone
      expect(screen.queryByTestId('loading-fallback')).not.toBeInTheDocument();
    });
  });

  describe('Route Loading Verification', () => {
    // Test that lazy imports resolve correctly
    it('should successfully import HomePage', async () => {
      const module = await import('@/features/home');
      expect(module.HomePage).toBeDefined();
    });

    it('should successfully import CharactersPage', async () => {
      const module = await import('@/features/characters');
      expect(module.CharactersPage).toBeDefined();
    });

    it('should successfully import CharacterDetailPage', async () => {
      const module = await import('@/features/characters');
      expect(module.CharacterDetailPage).toBeDefined();
    });

    it('should successfully import EventsPage', async () => {
      const module = await import('@/features/events');
      expect(module.EventsPage).toBeDefined();
    });

    it('should successfully import EventDetailPage', async () => {
      const module = await import('@/features/events');
      expect(module.EventDetailPage).toBeDefined();
    });

    it('should successfully import FestivalsPage', async () => {
      const module = await import('@/features/festivals');
      expect(module.FestivalsPage).toBeDefined();
    });

    it('should successfully import FestivalDetailPage', async () => {
      const module = await import('@/features/festivals');
      expect(module.FestivalDetailPage).toBeDefined();
    });

    it('should successfully import GachasPage', async () => {
      const module = await import('@/features/gachas');
      expect(module.GachasPage).toBeDefined();
    });

    it('should successfully import GachaDetailPage', async () => {
      const module = await import('@/features/gachas');
      expect(module.GachaDetailPage).toBeDefined();
    });

    it('should successfully import GuidesPage', async () => {
      const module = await import('@/features/guides');
      expect(module.GuidesPage).toBeDefined();
    });

    it('should successfully import GuideDetailPage', async () => {
      const module = await import('@/features/guides');
      expect(module.GuideDetailPage).toBeDefined();
    });

    it('should successfully import ToolsPage', async () => {
      const module = await import('@/features/tools');
      expect(module.ToolsPage).toBeDefined();
    });

    it('should successfully import ToolDetailPage', async () => {
      const module = await import('@/features/tools');
      expect(module.ToolDetailPage).toBeDefined();
    });

    it('should successfully import SwimsuitsPage', async () => {
      const module = await import('@/features/swimsuits');
      expect(module.SwimsuitsPage).toBeDefined();
    });

    it('should successfully import SwimsuitDetailPage', async () => {
      const module = await import('@/features/swimsuits');
      expect(module.SwimsuitDetailPage).toBeDefined();
    });

    it('should successfully import ItemsPage', async () => {
      const module = await import('@/features/items');
      expect(module.ItemsPage).toBeDefined();
    });

    it('should successfully import ItemDetailPage', async () => {
      const module = await import('@/features/items');
      expect(module.ItemDetailPage).toBeDefined();
    });

    it('should successfully import EpisodesPage', async () => {
      const module = await import('@/features/episodes');
      expect(module.EpisodesPage).toBeDefined();
    });

    it('should successfully import EpisodeDetailPage', async () => {
      const module = await import('@/features/episodes');
      expect(module.EpisodeDetailPage).toBeDefined();
    });

    it('should successfully import AccessoriesPage', async () => {
      const module = await import('@/features/accessories');
      expect(module.AccessoriesPage).toBeDefined();
    });

    it('should successfully import AccessoryDetailPage', async () => {
      const module = await import('@/features/accessories');
      expect(module.AccessoryDetailPage).toBeDefined();
    });

    it('should successfully import MissionsPage', async () => {
      const module = await import('@/features/missions');
      expect(module.MissionsPage).toBeDefined();
    });

    it('should successfully import MissionDetailPage', async () => {
      const module = await import('@/features/missions');
      expect(module.MissionDetailPage).toBeDefined();
    });

    it('should successfully import QuizzesPage', async () => {
      const module = await import('@/features/quiz');
      expect(module.QuizzesPage).toBeDefined();
    });

    it('should successfully import QuizDetailPage', async () => {
      const module = await import('@/features/quiz');
      expect(module.QuizDetailPage).toBeDefined();
    });

    it('should successfully import QuizTakingPage', async () => {
      const module = await import('@/features/quiz');
      expect(module.QuizTakingPage).toBeDefined();
    });

    it('should successfully import QuizResultPage', async () => {
      const module = await import('@/features/quiz');
      expect(module.QuizResultPage).toBeDefined();
    });

    it('should successfully import SearchResultsPage', async () => {
      const module = await import('@/features/search');
      expect(module.SearchResultsPage).toBeDefined();
    });

    it('should successfully import NotFoundPage', async () => {
      const module = await import('@/shared/pages');
      expect(module.NotFoundPage).toBeDefined();
    });
  });

  describe('Lazy Component Structure', () => {
    it('should export components as functions', async () => {
      // Verify components are exported as functions (React components)
      const homeModule = await import('@/features/home');
      expect(typeof homeModule.HomePage).toBe('function');

      const charactersModule = await import('@/features/characters');
      expect(typeof charactersModule.CharactersPage).toBe('function');
      expect(typeof charactersModule.CharacterDetailPage).toBe('function');

      const quizModule = await import('@/features/quiz');
      expect(typeof quizModule.QuizzesPage).toBe('function');
      expect(typeof quizModule.QuizDetailPage).toBe('function');
      expect(typeof quizModule.QuizTakingPage).toBe('function');
      expect(typeof quizModule.QuizResultPage).toBe('function');

      const searchModule = await import('@/features/search');
      expect(typeof searchModule.SearchResultsPage).toBe('function');
    });
  });
});
