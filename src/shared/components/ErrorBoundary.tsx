import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Props for the ErrorFallback component
 */
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  className?: string;
}

/**
 * ErrorFallback component displays a user-friendly error message with retry option.
 * This is the default fallback UI shown when an error is caught by ErrorBoundary.
 * 
 * @example
 * <ErrorFallback
 *   error={new Error("Something went wrong")}
 *   resetError={() => window.location.reload()}
 * />
 */
export function ErrorFallback({
  error,
  resetError,
  className,
}: ErrorFallbackProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-2">
        An unexpected error occurred. Please try again.
      </p>
      {error.message && (
        <p className="text-xs text-muted-foreground/70 max-w-md mb-4 font-mono">
          {error.message}
        </p>
      )}
      <Button onClick={resetError} variant="default">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}


/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the entire application.
 * 
 * Uses React's error boundary pattern with getDerivedStateFromError
 * and componentDidCatch lifecycle methods.
 * 
 * @example
 * <ErrorBoundary
 *   onError={(error, info) => logErrorToService(error, info)}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * @example
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Static method called when an error is thrown in a descendant component.
   * Updates state to trigger fallback UI rendering.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error is caught.
   * Used for logging error details for debugging purposes.
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details to console for debugging
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);

    // Call optional onError callback for external error reporting
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Resets the error state to allow re-rendering of children.
   * Can be passed to fallback components for retry functionality.
   */
  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, className } = this.props;

    if (hasError && error) {
      // If custom fallback is provided, render it
      if (fallback) {
        return fallback;
      }

      // Otherwise, render the default ErrorFallback component
      return (
        <ErrorFallback
          error={error}
          resetError={this.resetError}
          className={className}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
