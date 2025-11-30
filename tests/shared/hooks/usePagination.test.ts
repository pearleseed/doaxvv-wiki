import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination, usePaginatedData } from '../../../src/shared/hooks/usePagination';

describe('usePagination', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100 })
      );

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(5); // 100 / 24 (default)
      expect(result.current.itemsPerPage).toBe(24);
      expect(result.current.hasPrevious).toBe(false);
      expect(result.current.hasNext).toBe(true);
    });

    it('should initialize with custom values', () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
          initialPage: 3,
        })
      );

      expect(result.current.currentPage).toBe(3);
      expect(result.current.totalPages).toBe(10);
      expect(result.current.itemsPerPage).toBe(10);
    });

    it('should handle zero items', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 0 })
      );

      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('navigation', () => {
    it('should go to next page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should go to previous page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 })
      );

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(4);
    });

    it('should go to specific page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.goToPage(7);
      });

      expect(result.current.currentPage).toBe(7);
    });

    it('should go to first page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 })
      );

      act(() => {
        result.current.firstPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('should go to last page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.lastPage();
      });

      expect(result.current.currentPage).toBe(10);
    });

    it('should not go beyond last page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 10 })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(10);
      expect(result.current.hasNext).toBe(false);
    });

    it('should not go before first page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasPrevious).toBe(false);
    });
  });

  describe('indices calculation', () => {
    it('should calculate correct start and end indices', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      expect(result.current.startIndex).toBe(0);
      expect(result.current.endIndex).toBe(10);

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.startIndex).toBe(10);
      expect(result.current.endIndex).toBe(20);
    });

    it('should handle last page with fewer items', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 95, itemsPerPage: 10, initialPage: 10 })
      );

      expect(result.current.startIndex).toBe(90);
      expect(result.current.endIndex).toBe(95);
    });
  });

  describe('page range', () => {
    it('should calculate page range correctly', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, siblingCount: 2 })
      );

      expect(result.current.pageRange).toEqual([1, 2, 3, 4, 5]);

      act(() => {
        result.current.goToPage(5);
      });

      expect(result.current.pageRange).toEqual([3, 4, 5, 6, 7]);
    });

    it('should handle page range at the end', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, siblingCount: 2, initialPage: 10 })
      );

      expect(result.current.pageRange).toEqual([6, 7, 8, 9, 10]);
    });
  });

  describe('paginateItems', () => {
    it('should paginate array correctly', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 10, itemsPerPage: 3 })
      );

      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const paginated = result.current.paginateItems(items);

      expect(paginated).toEqual([1, 2, 3]);

      act(() => {
        result.current.nextPage();
      });

      const paginated2 = result.current.paginateItems(items);
      expect(paginated2).toEqual([4, 5, 6]);
    });
  });

  describe('reset', () => {
    it('should reset to initial page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 3 })
      );

      act(() => {
        result.current.goToPage(7);
      });

      expect(result.current.currentPage).toBe(7);

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentPage).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle single page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 5, itemsPerPage: 10 })
      );

      expect(result.current.totalPages).toBe(1);
      expect(result.current.hasNext).toBe(false);
      expect(result.current.hasPrevious).toBe(false);
    });

    it('should handle exact page boundary', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      expect(result.current.totalPages).toBe(10);
    });

    it('should handle items per page larger than total items', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 5, itemsPerPage: 100 })
      );

      expect(result.current.totalPages).toBe(1);
      expect(result.current.endIndex).toBe(5);
    });

    it('should clamp initial page to valid range', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, itemsPerPage: 10, initialPage: 100 })
      );

      expect(result.current.currentPage).toBeLessThanOrEqual(5);
    });

    it('should handle negative initial page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, itemsPerPage: 10, initialPage: -1 })
      );

      expect(result.current.currentPage).toBeGreaterThanOrEqual(1);
    });

    it('should handle very large datasets', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 1000000, itemsPerPage: 100 })
      );

      expect(result.current.totalPages).toBe(10000);
    });

    it('should handle fractional items per page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 7 })
      );

      expect(result.current.totalPages).toBeGreaterThan(14);
    });
  });

  describe('dynamic updates', () => {
    it('should update when totalItems changes', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination({ totalItems, itemsPerPage: 10 }),
        { initialProps: { totalItems: 50 } }
      );

      expect(result.current.totalPages).toBe(5);

      rerender({ totalItems: 100 });

      expect(result.current.totalPages).toBe(10);
    });

    it('should adjust current page if it exceeds new total pages', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination({ totalItems, itemsPerPage: 10 }),
        { initialProps: { totalItems: 100 } }
      );

      act(() => {
        result.current.goToPage(10);
      });

      expect(result.current.currentPage).toBe(10);

      rerender({ totalItems: 50 });

      expect(result.current.currentPage).toBeLessThanOrEqual(5);
    });
  });
});

describe('usePaginatedData', () => {
  it('should return paginated items', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));
    
    const { result } = renderHook(() =>
      usePaginatedData({ items, itemsPerPage: 10 })
    );

    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.paginatedItems[0].id).toBe(1);
    expect(result.current.totalItems).toBe(50);
  });

  it('should update paginated items when page changes', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));
    
    const { result } = renderHook(() =>
      usePaginatedData({ items, itemsPerPage: 10 })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.paginatedItems[0].id).toBe(11);
  });
});
