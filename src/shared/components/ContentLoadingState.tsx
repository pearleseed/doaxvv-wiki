import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ContentLoadingStateProps {
  /** Type of loading skeleton to display */
  variant?: "grid" | "list" | "detail" | "inline" | "spinner";
  /** Number of skeleton items for grid/list variants */
  count?: number;
  /** Number of columns for grid variant */
  columns?: 1 | 2 | 3 | 4;
  /** Custom loading message */
  message?: string;
  /** Show loading message */
  showMessage?: boolean;
  className?: string;
}

const SkeletonPulse = ({ className }: { className?: string }) => (
  <div className={cn("bg-muted animate-pulse rounded", className)} />
);

const GridItemSkeleton = () => (
  <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
    <SkeletonPulse className="aspect-square" />
    <div className="p-3 sm:p-4 space-y-2">
      <SkeletonPulse className="h-5 w-3/4" />
      <SkeletonPulse className="h-4 w-1/2" />
    </div>
  </div>
);

const ListItemSkeleton = () => (
  <div className="flex gap-4 p-4 rounded-lg border border-border/50 bg-card">
    <SkeletonPulse className="w-20 h-20 flex-shrink-0 rounded-lg" />
    <div className="flex-1 space-y-2">
      <SkeletonPulse className="h-5 w-3/4" />
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-1/2" />
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="space-y-6">
    {/* Breadcrumb */}
    <div className="flex items-center gap-2">
      <SkeletonPulse className="h-4 w-16" />
      <SkeletonPulse className="h-4 w-4" />
      <SkeletonPulse className="h-4 w-24" />
    </div>
    
    {/* Hero */}
    <div className="rounded-xl border border-border/50 bg-card p-6 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <SkeletonPulse className="h-10 sm:h-14 w-3/4" />
          <SkeletonPulse className="h-5 w-full" />
          <SkeletonPulse className="h-5 w-2/3" />
          <div className="flex gap-3 pt-2">
            <SkeletonPulse className="h-10 w-32 rounded-lg" />
            <SkeletonPulse className="h-10 w-28 rounded-lg" />
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <SkeletonPulse className="w-40 h-40 sm:w-56 sm:h-56 rounded-xl" />
        </div>
      </div>
    </div>
    
    {/* Content cards */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/50 bg-card p-6 space-y-4">
          <SkeletonPulse className="h-6 w-32" />
          <div className="space-y-2">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-3/4" />
            <SkeletonPulse className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InlineSkeleton = ({ message }: { message?: string }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    {message && <span className="text-sm text-muted-foreground">{message}</span>}
  </div>
);

const SpinnerSkeleton = ({ message }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
    {message && <p className="text-sm text-muted-foreground">{message}</p>}
  </div>
);

/**
 * ContentLoadingState provides consistent loading skeletons across the app.
 * Use this instead of plain "Loading..." text for better UX.
 * 
 * @example
 * // Grid loading
 * <ContentLoadingState variant="grid" count={8} columns={4} />
 * 
 * @example
 * // Detail page loading
 * <ContentLoadingState variant="detail" />
 * 
 * @example
 * // Inline spinner
 * <ContentLoadingState variant="inline" message="Loading more..." />
 */
export function ContentLoadingState({
  variant = "grid",
  count = 6,
  columns = 3,
  message,
  showMessage = false,
  className,
}: ContentLoadingStateProps) {
  const columnClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (variant === "spinner") {
    return <SpinnerSkeleton message={message} />;
  }

  if (variant === "inline") {
    return <InlineSkeleton message={message} />;
  }

  if (variant === "detail") {
    return (
      <div className={className}>
        <DetailSkeleton />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {showMessage && message && (
          <p className="text-sm text-muted-foreground text-center mb-4">{message}</p>
        )}
        {Array.from({ length: count }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Default: grid
  return (
    <div className={className}>
      {showMessage && message && (
        <p className="text-sm text-muted-foreground text-center mb-4">{message}</p>
      )}
      <div className={cn("grid gap-4 sm:gap-6", columnClasses[columns])}>
        {Array.from({ length: count }).map((_, i) => (
          <GridItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default ContentLoadingState;
