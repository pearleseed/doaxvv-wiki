import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

function Drawer({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
}

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

interface DrawerOverlayProps extends React.ComponentProps<typeof DrawerPrimitive.Overlay> {
  ref?: React.Ref<React.ElementRef<typeof DrawerPrimitive.Overlay>>;
}

function DrawerOverlay({ className, ref, ...props }: DrawerOverlayProps) {
  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  );
}

interface DrawerContentProps extends React.ComponentProps<typeof DrawerPrimitive.Content> {
  ref?: React.Ref<React.ElementRef<typeof DrawerPrimitive.Content>>;
}

function DrawerContent({ className, children, ref, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />;
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

interface DrawerTitleProps extends React.ComponentProps<typeof DrawerPrimitive.Title> {
  ref?: React.Ref<React.ElementRef<typeof DrawerPrimitive.Title>>;
}

function DrawerTitle({ className, ref, ...props }: DrawerTitleProps) {
  return (
    <DrawerPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

interface DrawerDescriptionProps extends React.ComponentProps<typeof DrawerPrimitive.Description> {
  ref?: React.Ref<React.ElementRef<typeof DrawerPrimitive.Description>>;
}

function DrawerDescription({ className, ref, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
