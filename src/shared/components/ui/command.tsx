import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "./dialog";

interface CommandProps extends React.ComponentProps<typeof CommandPrimitive> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive>>;
}

function Command({ className, ref, ...props }: CommandProps) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
}

interface CommandDialogProps extends DialogProps {}

function CommandDialog({ children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

interface CommandInputProps extends React.ComponentProps<typeof CommandPrimitive.Input> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Input>>;
}

function CommandInput({ className, ref, ...props }: CommandInputProps) {
  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

interface CommandListProps extends React.ComponentProps<typeof CommandPrimitive.List> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.List>>;
}

function CommandList({ className, ref, ...props }: CommandListProps) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

interface CommandEmptyProps extends React.ComponentProps<typeof CommandPrimitive.Empty> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Empty>>;
}

function CommandEmpty({ ref, ...props }: CommandEmptyProps) {
  return <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />;
}

interface CommandGroupProps extends React.ComponentProps<typeof CommandPrimitive.Group> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Group>>;
}

function CommandGroup({ className, ref, ...props }: CommandGroupProps) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

interface CommandSeparatorProps extends React.ComponentProps<typeof CommandPrimitive.Separator> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Separator>>;
}

function CommandSeparator({ className, ref, ...props }: CommandSeparatorProps) {
  return (
    <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />
  );
}

interface CommandItemProps extends React.ComponentProps<typeof CommandPrimitive.Item> {
  ref?: React.Ref<React.ElementRef<typeof CommandPrimitive.Item>>;
}

function CommandItem({ className, ref, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
