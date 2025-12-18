import { useState, useCallback, ImgHTMLAttributes } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Custom fallback icon component when image fails to load */
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  /** Aspect ratio for the container */
  aspectRatio?: 'square' | '16/9' | '4/3' | 'auto';
  /** Whether to show skeleton while loading (default: true) */
  showSkeleton?: boolean;
  /** Allow retry on error (default: true) */
  allowRetry?: boolean;
  /** Fallback image URL to try before showing error state */
  fallbackSrc?: string;
}

const ASPECT_RATIO_CLASSES: Record<string, string> = {
  'square': 'aspect-square',
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  'auto': '',
};

/**
 * OptimizedImage Component
 * 
 * A lazy-loading image component with skeleton placeholder and error fallback.
 * Features:
 * - Native lazy loading for deferred off-screen images
 * - Skeleton placeholder while loading
 * - Smooth fade-in transition (300ms) when loaded
 * - Fallback icon display on load failure with optional retry
 * - Optional fallback image URL
 * 
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/character.jpg"
 *   alt="Character name"
 *   aspectRatio="square"
 *   className="rounded-lg"
 *   fallbackSrc="/placeholder.svg"
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  fallbackIcon: FallbackIcon = ImageOff,
  aspectRatio = 'auto',
  showSkeleton = true,
  allowRetry = true,
  fallbackSrc,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true);
      setError(false);
      onLoad?.(e);
    },
    [onLoad]
  );

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      // Try fallback image first if available and not already using it
      if (fallbackSrc && !useFallback) {
        setUseFallback(true);
        return;
      }
      setError(true);
      setLoaded(false);
      onError?.(e);
    },
    [onError, fallbackSrc, useFallback]
  );

  const handleRetry = useCallback(() => {
    setError(false);
    setLoaded(false);
    setUseFallback(false);
    setRetryCount(c => c + 1);
  }, []);

  const aspectClass = ASPECT_RATIO_CLASSES[aspectRatio] || '';
  const containerClasses = cn(
    'relative overflow-hidden',
    aspectClass,
    className
  );

  const currentSrc = useFallback && fallbackSrc ? fallbackSrc : src;

  // Error state - show fallback icon with optional retry
  if (error) {
    return (
      <div 
        className={cn(
          containerClasses,
          'flex flex-col items-center justify-center bg-muted gap-2'
        )}
        role="img"
        aria-label={alt}
      >
        <FallbackIcon className="h-8 w-8 text-muted-foreground/50" />
        {allowRetry && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Retry loading image"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Skeleton placeholder - visible while loading */}
      {showSkeleton && !loaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {/* Actual image with lazy loading and fade-in transition */}
      <img
        key={`${currentSrc}-${retryCount}`}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
    </div>
  );
}

export default OptimizedImage;
