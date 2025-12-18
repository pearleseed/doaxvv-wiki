import { useState, useCallback, useEffect, useRef } from 'react';

export interface AsyncContentState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  isSuccess: boolean;
}

export interface UseAsyncContentOptions<T> {
  /** Initial data value */
  initialData?: T;
  /** Function to check if data is empty */
  isEmptyFn?: (data: T | undefined) => boolean;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback when data loads successfully */
  onSuccess?: (data: T) => void;
  /** Whether to enable the fetch */
  enabled?: boolean;
}

export interface UseAsyncContentResult<T> extends AsyncContentState<T> {
  refetch: () => Promise<void>;
  reset: () => void;
  setData: (data: T) => void;
}

/**
 * Hook for managing async content loading states.
 * Provides consistent loading, error, and empty state handling.
 * 
 * @example
 * const { data, isLoading, error, isEmpty, refetch } = useAsyncContent(
 *   () => fetchCharacters(),
 *   { isEmptyFn: (data) => !data || data.length === 0 }
 * );
 * 
 * if (isLoading) return <PageLoadingState />;
 * if (error) return <ErrorState error={error} onRetry={refetch} />;
 * if (isEmpty) return <EmptyState title="No characters found" />;
 * return <CharacterList data={data} />;
 */
export function useAsyncContent<T>(
  fetchFn: () => Promise<T>,
  options: UseAsyncContentOptions<T> = {}
): UseAsyncContentResult<T> {
  const {
    initialData,
    isEmptyFn = (data) => data === undefined || data === null || (Array.isArray(data) && data.length === 0),
    onError,
    onSuccess,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const fetchRef = useRef(fetchFn);

  // Keep fetchFn ref updated
  fetchRef.current = fetchFn;

  const fetch = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchRef.current();
      
      if (isMountedRef.current) {
        setData(result);
        setIsLoading(false);
        onSuccess?.(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);
        onError?.(error);
      }
    }
  }, [enabled, onError, onSuccess]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData]);

  // Initial fetch
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isEmpty = !isLoading && !error && isEmptyFn(data);
  const isSuccess = !isLoading && !error && !isEmpty;

  return {
    data,
    isLoading,
    error,
    isEmpty,
    isSuccess,
    refetch: fetch,
    reset,
    setData,
  };
}

/**
 * Utility type guard for checking if content state is ready
 */
export function isContentReady<T>(state: AsyncContentState<T>): state is AsyncContentState<T> & { data: T } {
  return state.isSuccess && state.data !== undefined;
}

export default useAsyncContent;
