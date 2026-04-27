import { useContext } from "react"
import { ToastProviderContext } from "@/components/ui/toast-provider"

export function useToast() {
  const context = useContext(ToastProviderContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}