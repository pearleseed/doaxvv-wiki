import CardSkeleton from "./CardSkeleton";

interface GridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  variant?: "default" | "horizontal" | "featured";
  className?: string;
}

/**
 * Skeleton loading component for grids of cards.
 * Renders the specified number of CardSkeleton components in a grid layout.
 */
const GridSkeleton = ({
  count = 6,
  columns = 3,
  variant = "default",
  className = "",
}: GridSkeletonProps) => {
  const columnClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-4 md:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
};

export default GridSkeleton;
