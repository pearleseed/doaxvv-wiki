import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

interface AccordionItemProps extends React.ComponentProps<typeof AccordionPrimitive.Item> {
  ref?: React.Ref<React.ElementRef<typeof AccordionPrimitive.Item>>;
}

function AccordionItem({ className, ref, ...props }: AccordionItemProps) {
  return <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />;
}

interface AccordionTriggerProps extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  ref?: React.Ref<React.ElementRef<typeof AccordionPrimitive.Trigger>>;
}

function AccordionTrigger({ className, children, ref, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown 
          className="h-4 w-4 shrink-0 transition-transform duration-200" 
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

interface AccordionContentProps extends React.ComponentProps<typeof AccordionPrimitive.Content> {
  ref?: React.Ref<React.ElementRef<typeof AccordionPrimitive.Content>>;
}

function AccordionContent({ className, children, ref, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
