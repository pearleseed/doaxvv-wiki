/**
 * usePagination Hook
 * Reusable pagination logic with memoization for performance
 */

import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationOptions {
  /** Total number of items */
  totalItems: number;
  /** Items per page (default: 24) */
  itemsPerPage?: number;
  /** Initial page (default: 1) */
  initialPage?: number;
  /** Number of page buttons to show (default: 5) */
  siblingCount?: number;
}

export interface UsePaginationResult<T> {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a previous page */
  hasPrevious: boolean;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Start index for slicing data (0-indexed) */
  startIndex: number;
  /** End index for slicing data (0-indexed, exclusive) */
  endIndex: number;
  /** Items per page */
  itemsPerPage: number;
  /** Range of visible page numbers for pagination UI */
  pageRange: number[];
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Reset to first page */
  reset: () => void;
  /** Paginate an array of items */
  paginateItems: <T>(items: T[]) => T[];
}

const DEFAULT_ITEMS_PER_PAGE = 24;
const DEFAULT_SIBLING_COUNT = 2;

export function usePagination<T = unknown>({
  totalItems,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  initialPage = 1,
  siblingCount = DEFAULT_SIBLING_COUNT,
}: UsePaginationOptions): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  // Ensure current page is within bounds
  const safePage = useMemo(() => 
    Math.min(Math.max(1, currentPage), totalPages),
    [currentPage, totalPages]
  );

  // Calculate indices
  const startIndex = useMemo(() => 
    (safePage - 1) * itemsPerPage,
    [safePage, itemsPerPage]
  );

  const endIndex = useMemo(() => 
    Math.min(startIndex + itemsPerPage, totalItems),
    [startIndex, itemsPerPage, totalItems]
  );

  // Navigation flags
  const hasPrevious = safePage > 1;
  const hasNext = safePage < totalPages;

  // Calculate page range for pagination UI
  const pageRange = useMemo(() => {
    const range: number[] = [];
    
    // Calculate start and end of page range
    let start = Math.max(1, safePage - siblingCount);
    let end = Math.min(totalPages, safePage + siblingCount);
    
    // Adjust if we're near the beginning or end
    if (safePage <= siblingCount + 1) {
      end = Math.min(totalPages, siblingCount * 2 + 1);
    }
    if (safePage >= totalPages - siblingCount) {
      start = Math.max(1, totalPages - siblingCount * 2);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  }, [safePage, totalPages, siblingCount]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const newPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(newPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setCurrentPage(p => p + 1);
    }
  }, [hasNext]);

  const previousPage = useCallback(() => {
    if (hasPrevious) {
      setCurrentPage(p => p - 1);
    }
  }, [hasPrevious]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Utility function to paginate an array
  const paginateItems = useCallback(<T>(items: T[]): T[] => {
    return items.slice(startIndex, endIndex);
  }, [startIndex, endIndex]);

  return {
    currentPage: safePage,
    totalPages,
    hasPrevious,
    hasNext,
    startIndex,
    endIndex,
    itemsPerPage,
    pageRange,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    reset,
    paginateItems,
  };
}

/**
 * usePaginatedData Hook
 * Combines pagination with data management
 */
export interface UsePaginatedDataOptions<T> {
  /** Full array of items */
  items: T[];
  /** Items per page (default: 24) */
  itemsPerPage?: number;
  /** Initial page (default: 1) */
  initialPage?: number;
}

export interface UsePaginatedDataResult<T> extends Omit<UsePaginationResult<T>, 'paginateItems'> {
  /** Paginated items for current page */
  paginatedItems: T[];
  /** Total number of items */
  totalItems: number;
}

export function usePaginatedData<T>({
  items,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  initialPage = 1,
}: UsePaginatedDataOptions<T>): UsePaginatedDataResult<T> {
  const pagination = usePagination<T>({
    totalItems: items.length,
    itemsPerPage,
    initialPage,
  });

  const paginatedItems = useMemo(() => 
    items.slice(pagination.startIndex, pagination.endIndex),
    [items, pagination.startIndex, pagination.endIndex]
  );

  return {
    ...pagination,
    paginatedItems,
    totalItems: items.length,
  };
}

export default usePagination;

