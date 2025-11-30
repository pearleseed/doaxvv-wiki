import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent } from "@/shared/components/ui/card";

interface CardSkeletonProps {
  variant?: "default" | "horizontal" | "featured";
  className?: string;
}

/**
 * Skeleton loading component that matches ContentCard layouts.
 * Displays animated placeholders while content is loading.
 */
const CardSkeleton = ({ variant = "default", className = "" }: CardSkeletonProps) => {
  if (variant === "horizontal") {
    return (
      <Card className={`overflow-hidden border-border/50 bg-card ${className}`}>
        <div className="flex flex-col sm:flex-row">
          {/* Image skeleton */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
            <Skeleton className="w-full h-full min-h-[120px]" />
          </div>
          <CardContent className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Title with icon */}
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-6 w-48" />
              </div>
              {/* Description */}
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
            {/* Meta info */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className={`overflow-hidden border-border/50 bg-card ${className}`}>
        {/* Featured image area with 16:9 aspect ratio */}
        <div className="relative aspect-[16/9]">
          <Skeleton className="w-full h-full" />
          {/* Badge placeholder */}
          <div className="absolute top-3 left-3">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {/* Title overlay area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-9 w-9 rounded-lg bg-background/20" />
              <Skeleton className="h-7 w-48 bg-background/20" />
            </div>
            <Skeleton className="h-4 w-full bg-background/20" />
          </div>
        </div>
        {/* Tags and meta section */}
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - matches square card layout
  return (
    <Card className={`overflow-hidden border-border/50 bg-card h-full ${className}`}>
      {/* Square image area */}
      <div className="relative aspect-square">
        <Skeleton className="w-full h-full" />
        {/* Badge placeholder */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
      <CardContent className="p-4">
        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {/* Description */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CardSkeleton;
