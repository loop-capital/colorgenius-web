import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const selectVariants = cva(
  "inline-flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "border-destructive text-destructive-foreground bg-destructive focus-visible:ring-destructive",
        outline: "border border-input hover:bg-accent",
        secondary: "border-secondary text-secondary-foreground bg-secondary",
        ghost: "hover:bg-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    variant?: VariantProps<typeof selectVariants>["variant"];
    className?: string;
  }
>(({ className, variant, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(selectVariants({ variant, className }))}
    {...props}
  >
    <Slot className="pointer-events-none inline-shrink-0 h-4 w-4">
      <ChevronDown className="ms-2 h-3 w-3" />
    </Slot>
    <Slot className="mt-0 flex-1 items-center whitespace-nowrap">
      <span className="placeholder">{props.placeholder}</span>
    </Slot>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      "relative z-50 mt-2 max-h-96 w-full overflow-hidden rounded-md border bg-popover p-1 text-sm shadow-lg",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn("flex w-full items-center", className)}
    {...props}
  />
));
SelectValue.displayName = SelectPrimitive.Value.displayName;

export const Select = Object.assign(SelectPrimitive.Root, {
  value: SelectPrimitive.Value,
  trigger: SelectTrigger,
  content: SelectContent,
  item: SelectItem,
  separator: SelectPrimitive.Separator,
  group: SelectPrimitive.Group,
  label: SelectPrimitive.Label,
  separator: SelectPrimitive.Separator,
  portal: SelectPrimitive.Portal,
});