import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

interface ContextMenuSubTriggerProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> {
  ref?: React.Ref<React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>>;
  inset?: boolean;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ref,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

interface ContextMenuSubContentProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.SubContent> {
  ref?: React.Ref<React.ElementRef<typeof ContextMenuPrimitive.SubContent>>;
}

function ContextMenuSubContent({
  className,
  ref,
  ...props
}: ContextMenuSubContentProps) {
  return (
    <ContextMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  );
}

interface ContextMenuContentProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Content> {
  ref?: React.Ref<React.ElementRef<typeof ContextMenuPrimitive.Content>>;
}

function ContextMenuContent({
  className,
  ref,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

interface ContextMenuItemProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Item> {
  ref?: React.Ref<React.ElementRef<typeof ContextMenuPrimitive.Item>>;
  inset?: boolean;
}

function ContextMenuItem({
  className,
  inset,
  ref,
  ...props
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

interface ContextMenuCheckboxItemProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> {
  ref?: React.Ref<React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>>;
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ref,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

interface ContextMenuRadioItemProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> {
  ref?: React.Ref<React.ElementRef<typeof ContextMenuPrimitive.RadioItem>>;
}

function ContextMenuRadioItem({
  className,
  children,
  ref,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

interface ContextMenuLabelProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Label> {
  ref?: React.Ref<React.ElementRef<typeof ContextMenuPrimitive.Label>>;
  inset?: boolean;
}

function ContextMenuLabel({
  className,
  inset,
  ref,
  ...props
}: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.Label
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
      {...props}
    />
  );
}

interface ContextMenuSeparatorProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Separator> {
  ref?: React.Ref<React.ElementRef<typeof ContextMenuPrimitive.Separator>>;
}

function ContextMenuSeparator({
  className,
  ref,
  ...props
}: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
