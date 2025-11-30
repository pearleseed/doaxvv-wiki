import { cn } from "@/lib/utils";

interface MobileOnlyProps {
  children: React.ReactNode;
  className?: string;
  /** Breakpoint at which to hide - defaults to lg (1024px) */
  breakpoint?: "sm" | "md" | "lg" | "xl";
}

const breakpointClasses = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};

/**
 * Renders children only on mobile/smaller screens.
 * Hidden at the specified breakpoint and above.
 */
export function MobileOnly({
  children,
  className,
  breakpoint = "lg",
}: MobileOnlyProps) {
  return (
    <div className={cn("block", breakpointClasses[breakpoint], className)}>
      {children}
    </div>
  );
}
