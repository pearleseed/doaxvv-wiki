import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, FileWarning } from "lucide-react";

export interface ErrorStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

export interface ErrorStateProps {
  /** Error object or message */
  error?: Error | string | null;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Primary action (usually retry) */
  action?: ErrorStateAction;
  /** Secondary action */
  secondaryAction?: ErrorStateAction;
  /** Error variant for different styling */
  variant?: "default" | "network" | "server" | "notFound" | "inline";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show error details (message) */
  showDetails?: boolean;
  className?: string;
}

const VARIANT_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultDescription: string;
}> = {
  default: {
    icon: AlertTriangle,
    defaultTitle: "Something went wrong",
    defaultDescription: "An unexpected error occurred. Please try again.",
  },
  network: {
    icon: WifiOff,
    defaultTitle: "Connection error",
    defaultDescription: "Unable to connect. Please check your internet connection.",
  },
  server: {
    icon: ServerCrash,
    defaultTitle: "Server error",
    defaultDescription: "The server encountered an error. Please try again later.",
  },
  notFound: {
    icon: FileWarning,
    defaultTitle: "Not found",
    defaultDescription: "The requested content could not be found.",
  },
  inline: {
    icon: AlertTriangle,
    defaultTitle: "Error",
    defaultDescription: "Something went wrong.",
  },
};

const SIZE_CLASSES = {
  sm: {
    container: "py-6 px-3",
    icon: "h-6 w-6 mb-2",
    title: "text-sm font-medium mb-1",
    description: "text-xs max-w-xs mb-3",
    details: "text-xs",
  },
  md: {
    container: "py-10 px-4",
    icon: "h-10 w-10 mb-4",
    title: "text-lg font-semibold mb-2",
    description: "text-sm max-w-md mb-4",
    details: "text-xs",
  },
  lg: {
    container: "py-16 px-6",
    icon: "h-14 w-14 mb-6",
    title: "text-xl font-bold mb-3",
    description: "text-base max-w-lg mb-6",
    details: "text-sm",
  },
};

/**
 * ErrorState component displays user-friendly error messages with retry options.
 * 
 * @example
 * // Basic usage
 * <ErrorState
 *   error={error}
 *   action={{ label: "Try again", onClick: refetch }}
 * />
 * 
 * @example
 * // Network error variant
 * <ErrorState
 *   variant="network"
 *   action={{ label: "Retry", onClick: refetch }}
 * />
 * 
 * @example
 * // Inline error (for forms, etc.)
 * <ErrorState
 *   variant="inline"
 *   error="Failed to save changes"
 *   size="sm"
 * />
 */
export function ErrorState({
  error,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  size = "md",
  showDetails = true,
  className,
}: ErrorStateProps) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  const sizeClasses = SIZE_CLASSES[size];
  const Icon = config.icon;
  
  const errorMessage = error instanceof Error ? error.message : error;
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;

  // Inline variant uses Alert component
  if (variant === "inline") {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{displayTitle}</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <span>{displayDescription}</span>
          {showDetails && errorMessage && (
            <code className="text-xs bg-destructive/10 px-2 py-1 rounded">
              {errorMessage}
            </code>
          )}
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="w-fit mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeClasses.container,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="rounded-full bg-destructive/10 p-4 mb-2">
        <Icon className={cn("text-destructive", sizeClasses.icon)} />
      </div>
      <h3 className={cn("text-foreground", sizeClasses.title)}>{displayTitle}</h3>
      <p className={cn("text-muted-foreground", sizeClasses.description)}>
        {displayDescription}
      </p>
      {showDetails && errorMessage && (
        <p className={cn(
          "text-muted-foreground/70 font-mono bg-muted px-3 py-2 rounded mb-4 max-w-md break-all",
          sizeClasses.details
        )}>
          {errorMessage}
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
              <RefreshCw className="h-4 w-4 mr-2" />
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

export default ErrorState;
