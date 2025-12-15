import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  ref?: React.Ref<HTMLElement>;
  separator?: React.ReactNode;
}

function Breadcrumb({ ref, ...props }: BreadcrumbProps) {
  return <nav ref={ref} aria-label="breadcrumb" {...props} />;
}

interface BreadcrumbListProps extends React.ComponentProps<"ol"> {
  ref?: React.Ref<HTMLOListElement>;
}

function BreadcrumbList({ className, ref, ...props }: BreadcrumbListProps) {
  return (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

interface BreadcrumbItemProps extends React.ComponentProps<"li"> {
  ref?: React.Ref<HTMLLIElement>;
}

function BreadcrumbItem({ className, ref, ...props }: BreadcrumbItemProps) {
  return <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

interface BreadcrumbLinkProps extends React.ComponentProps<"a"> {
  ref?: React.Ref<HTMLAnchorElement>;
  asChild?: boolean;
}

function BreadcrumbLink({ asChild, className, ref, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : "a";

  return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />;
}

interface BreadcrumbPageProps extends React.ComponentProps<"span"> {
  ref?: React.Ref<HTMLSpanElement>;
}

function BreadcrumbPage({ className, ref, ...props }: BreadcrumbPageProps) {
  return (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
