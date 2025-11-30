/**
 * VirtualizedList Component
 * Efficiently renders large lists using @tanstack/react-virtual
 * Only renders visible items + overscan for smooth scrolling
 */

import { useRef, useCallback, ReactNode } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

export interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of the scrollable container */
  height?: number | string;
  /** Estimated height of each item (for initial calculation) */
  estimateSize?: number;
  /** Number of items to render outside visible area */
  overscan?: number;
  /** Render function for each item */
  renderItem: (item: T, index: number, virtualRow: VirtualItem) => ReactNode;
  /** Key extractor function */
  getKey?: (item: T, index: number) => string | number;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the inner content */
  contentClassName?: string;
  /** Number of columns for grid layout */
  columns?: number;
  /** Gap between items (in pixels) */
  gap?: number;
  /** Callback when user scrolls near the end */
  onLoadMore?: () => void;
  /** Whether more items are available to load */
  hasMore?: boolean;
  /** Loading indicator component */
  loadingIndicator?: ReactNode;
  /** Empty state component */
  emptyState?: ReactNode;
}

export function VirtualizedList<T>({
  items,
  height = 600,
  estimateSize = 88,
  overscan = 5,
  renderItem,
  getKey,
  className,
  contentClassName,
  columns = 1,
  gap = 16,
  onLoadMore,
  hasMore,
  loadingIndicator,
  emptyState,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate row count for grid layout
  const rowCount = Math.ceil(items.length / columns);
  
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!onLoadMore || !hasMore) return;
    
    const container = parentRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when 80% scrolled
    if (scrollPercentage > 0.8) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore]);

  // Empty state
  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className={cn("overflow-auto", className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div
        className={cn("relative w-full", contentClassName)}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualRows.map((virtualRow) => {
          // Calculate items for this row (for grid layout)
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              className={cn(
                "absolute top-0 left-0 w-full",
                columns > 1 && "grid"
              )}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
                ...(columns > 1 && {
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: `${gap}px`,
                }),
              }}
            >
              {rowItems.map((item, colIndex) => {
                const index = startIndex + colIndex;
                const key = getKey ? getKey(item, index) : index;
                
                return (
                  <div key={key} className="h-full">
                    {renderItem(item, index, virtualRow)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Loading indicator */}
      {hasMore && loadingIndicator && (
        <div className="flex justify-center py-4">
          {loadingIndicator}
        </div>
      )}
    </div>
  );
}

/**
 * Simple virtualized list for single-column layouts
 */
export interface SimpleVirtualListProps<T> {
  items: T[];
  height?: number | string;
  estimateSize?: number;
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => string | number;
  className?: string;
  emptyState?: ReactNode;
}

export function SimpleVirtualList<T>({
  items,
  height = 600,
  estimateSize = 72,
  renderItem,
  getKey,
  className,
  emptyState,
}: SimpleVirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 10,
  });

  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          const key = getKey ? getKey(item, virtualRow.index) : virtualRow.index;
          
          return (
            <div
              key={key}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedList;

