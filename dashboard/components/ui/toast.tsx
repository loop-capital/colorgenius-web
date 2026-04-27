import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = ToastPrimitive.Viewport

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    className?: string
  }
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Root
    className={cn(
      "pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-xs flex-col-end space-y-4",
      className
    )}
    ref={ref}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

export { ToastProvider, ToastViewport, Toast }