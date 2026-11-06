import { userMessage, type ApiError } from "@/api/errors"
import { useEffect } from "react"
import { useToast } from "./useToast"


export function useErrorToast(error: ApiError | undefined) {
  const toast = useToast()
  useEffect(() => {
    if (error && !error.isCanceled) toast.error(userMessage(error))
  }, [error, toast])
}
