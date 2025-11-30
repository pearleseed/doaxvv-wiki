import { cn } from "@/lib/utils";

interface DesktopOnlyProps {
  children: React.ReactNode;
  className?: string;
  /** Breakpoint at which to show - defaults to lg (1024px) */
  breakpoint?: "sm" | "md" | "lg" | "xl";
}

const breakpointClasses = {
  sm: "hidden sm:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
};

/**
 * Renders children only on desktop/larger screens.
 * Hidden below the specified breakpoint.
 */
export function DesktopOnly({
  children,
  className,
  breakpoint = "lg",
}: DesktopOnlyProps) {
  return (
    <div className={cn(breakpointClasses[breakpoint], className)}>
      {children}
    </div>
  );
}
