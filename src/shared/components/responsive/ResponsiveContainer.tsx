import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum width constraint - defaults to 1400px (2xl breakpoint) */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Padding on mobile - defaults to px-4 */
  mobilePadding?: string;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-[1400px]",
  full: "max-w-full",
};

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "2xl",
  mobilePadding = "px-4",
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        mobilePadding,
        "sm:px-6 lg:px-8",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
