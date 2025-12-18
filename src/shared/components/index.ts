// Shared components barrel export
export * from './responsive';
export * from './skeletons';
export { default as Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
export { default as ContentCard } from './ContentCard';
export { default as RelatedContent } from './RelatedContent';

export { LocalizedText } from './LocalizedText';
export { LanguageSwitcher } from './LanguageSwitcher';
export { TranslationIndicator } from './TranslationIndicator';
export { DatasetImage, type DatasetImageProps } from './DatasetImage';
export { 
  VirtualizedList, 
  SimpleVirtualList,
  type VirtualizedListProps,
  type SimpleVirtualListProps 
} from './VirtualizedList';
export { PaginatedGrid, type PaginatedGridProps } from './PaginatedGrid';
export { OptimizedImage, type OptimizedImageProps } from './OptimizedImage';
export { EmptyState, type EmptyStateProps, type EmptyStateAction } from './EmptyState';
export { ErrorState, type ErrorStateProps, type ErrorStateAction } from './ErrorState';
export { ContentLoadingState, type ContentLoadingStateProps } from './ContentLoadingState';
export { PageLoadingState, type PageLoadingStateProps } from './PageLoadingState';
export { 
  ErrorBoundary, 
  ErrorFallback, 
  type ErrorBoundaryProps, 
  type ErrorFallbackProps 
} from './ErrorBoundary';
export { 
  FilterPresets, 
  type FilterPresetsProps, 
  type FilterPreset 
} from './FilterPresets';
export { UniqueKeyDisplay } from './UniqueKeyDisplay';
export { MarkdownRenderer } from './MarkdownRenderer';
export { ScrollToTop } from './ScrollToTop';
export { 
  UnifiedFilterUI, 
  type UnifiedFilterUIProps 
} from './UnifiedFilterUI';
export { CustomContextMenu } from './CustomContextMenu';
export { default as PDFViewer, type PDFViewerProps } from './PDFViewer';
