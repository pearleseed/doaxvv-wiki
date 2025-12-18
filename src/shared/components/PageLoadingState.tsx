import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageLoadingStateProps {
  /** Type of page being loaded */
  variant?: "list" | "detail" | "grid";
  /** Number of skeleton items for list/grid variants */
  itemCount?: number;
  /** Number of columns for grid variant */
  columns?: 2 | 3 | 4;
  /** Show filter skeleton */
  showFilters?: boolean;
  /** Show breadcrumb skeleton */
  showBreadcrumb?: boolean;
  className?: string;
}

const SkeletonPulse = ({ className }: { className?: string }) => (
  <div className={cn("bg-muted animate-pulse rounded", className)} />
);

const BreadcrumbSkeleton = () => (
  <div className="flex items-center gap-2 mb-6">
    <SkeletonPulse className="h-4 w-16" />
    <SkeletonPulse className="h-4 w-4" />
    <SkeletonPulse className="h-4 w-24" />
  </div>
);

const TitleSkeleton = () => (
  <div className="mb-6 sm:mb-8">
    <SkeletonPulse className="h-10 sm:h-12 w-48 mb-2" />
    <SkeletonPulse className="h-5 w-64" />
  </div>
);

const FilterSkeleton = () => (
  <div className="flex flex-wrap gap-4 mb-6">
    <SkeletonPulse className="h-10 flex-1 max-w-md" />
    <SkeletonPulse className="h-10 w-32" />
    <SkeletonPulse className="h-10 w-28" />
  </div>
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
    <SkeletonPulse className="w-24 h-24 flex-shrink-0 rounded-lg" />
    <div className="flex-1 space-y-2">
      <SkeletonPulse className="h-5 w-3/4" />
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-1/2" />
      <div className="flex gap-2 pt-1">
        <SkeletonPulse className="h-5 w-16 rounded-full" />
        <SkeletonPulse className="h-5 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

const DetailHeroSkeleton = () => (
  <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4 sm:p-8 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4 order-2 md:order-1">
        <SkeletonPulse className="h-6 w-20 rounded-full" />
        <SkeletonPulse className="h-10 sm:h-14 w-3/4" />
        <SkeletonPulse className="h-5 w-full" />
        <SkeletonPulse className="h-5 w-2/3" />
        <div className="flex gap-3 pt-2">
          <SkeletonPulse className="h-10 w-32 rounded-lg" />
          <SkeletonPulse className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="flex justify-center md:justify-end items-center order-1 md:order-2">
        <SkeletonPulse className="w-40 h-40 sm:w-56 sm:h-56 rounded-xl" />
      </div>
    </div>
  </div>
);

const DetailContentSkeleton = () => (
  <>
    {/* Tabs skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-muted/50 rounded-lg mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonPulse key={i} className="h-10 rounded-md" />
      ))}
    </div>
    
    {/* Content cards skeleton */}
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
  </>
);

/**
 * PageLoadingState provides consistent page-level loading skeletons.
 * Use this for full page loading states instead of plain text.
 * 
 * @example
 * // List page loading
 * <PageLoadingState variant="list" itemCount={6} showFilters />
 * 
 * @example
 * // Detail page loading
 * <PageLoadingState variant="detail" showBreadcrumb />
 * 
 * @example
 * // Grid page loading
 * <PageLoadingState variant="grid" columns={4} itemCount={8} />
 */
export function PageLoadingState({
  variant = "grid",
  itemCount = 6,
  columns = 3,
  showFilters = true,
  showBreadcrumb = true,
  className,
}: PageLoadingStateProps) {
  const columnClasses: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (variant === "detail") {
    return (
      <div className={className}>
        {showBreadcrumb && <BreadcrumbSkeleton />}
        <DetailHeroSkeleton />
        <DetailContentSkeleton />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={className}>
        {showBreadcrumb && <BreadcrumbSkeleton />}
        <TitleSkeleton />
        {showFilters && <FilterSkeleton />}
        <div className="space-y-4">
          {Array.from({ length: itemCount }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Default: grid
  return (
    <div className={className}>
      {showBreadcrumb && <BreadcrumbSkeleton />}
      <TitleSkeleton />
      {showFilters && <FilterSkeleton />}
      <div className={cn("grid gap-4 sm:gap-6", columnClasses[columns])}>
        {Array.from({ length: itemCount }).map((_, i) => (
          <GridItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default PageLoadingState;
