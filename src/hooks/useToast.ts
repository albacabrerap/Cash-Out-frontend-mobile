import { use } from "react"
import { ToastContext, type ToastApi } from "@/contexts/toastContext"

export function useToast(): ToastApi {
  const context = use(ToastContext)
  if (!context) throw new Error("useToast debe usarse dentro de <ToastProvider>")
  return context
}
