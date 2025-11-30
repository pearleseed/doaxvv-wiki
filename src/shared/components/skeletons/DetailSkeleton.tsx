import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";

interface DetailSkeletonProps {
  showImage?: boolean;
  showStats?: boolean;
  className?: string;
}

/**
 * Skeleton loading component for detail pages.
 * Displays animated placeholders matching the detail page layout.
 */
const DetailSkeleton = ({
  showImage = true,
  showStats = true,
  className = "",
}: DetailSkeletonProps) => {
  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Hero Section skeleton */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
          <div className="md:col-span-2 space-y-3 sm:space-y-4 order-2 md:order-1">
            {/* Badge */}
            <Skeleton className="h-6 w-20 rounded-full" />
            {/* Title */}
            <Skeleton className="h-10 sm:h-14 w-3/4" />
            {/* Description */}
            <Skeleton className="h-5 w-full max-w-2xl" />
            <Skeleton className="h-5 w-2/3 max-w-xl" />
            {/* Stats badges */}
            {showStats && (
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
              </div>
            )}
          </div>
          {/* Image */}
          {showImage && (
            <div className="flex justify-center md:justify-end items-center order-1 md:order-2">
              <Skeleton className="w-40 h-40 sm:w-64 sm:h-64 rounded-xl" />
            </div>
          )}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4 sm:space-y-6">
        {/* Tab list */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-muted rounded-lg">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>

        {/* Tab content - Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showStats && (
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
              )}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-28" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Skeleton className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetailSkeleton;
