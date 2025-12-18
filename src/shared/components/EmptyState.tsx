import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { FileQuestion, SearchX, ImageOff, WifiOff, AlertCircle } from "lucide-react";

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
  secondaryAction?: EmptyStateAction;
  className?: string;
  /** Preset variants for common empty states */
  variant?: "default" | "search" | "image" | "offline" | "error";
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const VARIANT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  default: FileQuestion,
  search: SearchX,
  image: ImageOff,
  offline: WifiOff,
  error: AlertCircle,
};

const SIZE_CLASSES = {
  sm: {
    container: "py-8 px-3",
    icon: "h-8 w-8 mb-3",
    title: "text-base font-medium mb-1",
    description: "text-xs max-w-xs mb-3",
  },
  md: {
    container: "py-12 px-4",
    icon: "h-12 w-12 mb-4",
    title: "text-lg font-semibold mb-2",
    description: "text-sm max-w-md mb-4",
  },
  lg: {
    container: "py-16 px-6",
    icon: "h-16 w-16 mb-6",
    title: "text-xl font-bold mb-3",
    description: "text-base max-w-lg mb-6",
  },
};

/**
 * EmptyState component displays a helpful message when no content is available.
 * It provides context about why there's no content and optional actions users can take.
 * 
 * @example
 * // Basic usage
 * <EmptyState
 *   title="No results found"
 *   description="Try adjusting your search or filters"
 *   action={{ label: "Clear filters", onClick: handleClearFilters }}
 * />
 * 
 * @example
 * // With preset variant
 * <EmptyState
 *   variant="search"
 *   title="No matches"
 *   description="We couldn't find what you're looking for"
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = "default",
  size = "md",
}: EmptyStateProps) {
  const Icon = icon || VARIANT_ICONS[variant] || FileQuestion;
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeClasses.container,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-muted/50 p-4 mb-2">
        <Icon className={cn("text-muted-foreground", sizeClasses.icon)} />
      </div>
      <h3 className={cn("text-foreground", sizeClasses.title)}>{title}</h3>
      {description && (
        <p className={cn("text-muted-foreground", sizeClasses.description)}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant={action.variant || "default"}
              onClick={action.onClick}
              size={size === "sm" ? "sm" : "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "outline"}
              onClick={secondaryAction.onClick}
              size={size === "sm" ? "sm" : "default"}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
