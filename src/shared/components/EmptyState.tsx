import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { FileQuestion } from "lucide-react";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

/**
 * EmptyState component displays a helpful message when no content is available.
 * It provides context about why there's no content and optional actions users can take.
 * 
 * @example
 * <EmptyState
 *   icon={SearchX}
 *   title="No results found"
 *   description="Try adjusting your search or filters"
 *   action={{
 *     label: "Clear filters",
 *     onClick: handleClearFilters
 *   }}
 * />
 */
export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || "default"}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
