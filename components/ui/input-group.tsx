import * as React from "react"
import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center", className)}
      {...props}
    />
  )
})
InputGroup.displayName = "InputGroup"

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "rounded-none first:rounded-l-md last:rounded-r-md",
        "[&:not(:first-child)]:border-l-0 [&:not(:last-child)]:border-r-0",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
})
InputGroupInput.displayName = "InputGroupInput"

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center px-3 text-sm text-muted-foreground bg-muted border border-input h-9 rounded-none",
        "first:rounded-l-md first:border-r-0",
        "last:rounded-r-md last:border-l-0",
        "[&:not(:first-child)]:border-l-0",
        className
      )}
      {...props}
    />
  )
})
InputGroupAddon.displayName = "InputGroupAddon"

export { InputGroup, InputGroupInput, InputGroupAddon }

