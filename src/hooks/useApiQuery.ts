import { toApiError, type ApiError } from "@/api/errors"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

export interface ApiQuery<T> {
  data: T | undefined
  error: ApiError | undefined
  isLoading: boolean
  isRefreshing: boolean
  reload(): void
}

interface Settled<T> {
  request: string
  data?: T
  error?: ApiError
}

export function useApiQuery<T>(
  key: readonly unknown[],
  fetcher: (signal: AbortSignal) => Promise<T>,
): ApiQuery<T> {
  const [nonce, setNonce] = useState(0)
  const [settled, setSettled] = useState<Settled<T>>()

  const request = JSON.stringify([key, nonce])

  const fetcherRef = useRef(fetcher)
  useLayoutEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    const controller = new AbortController()

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ request, data })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const error = toApiError(err)
        if (!error.isCanceled) setSettled((previous) => ({ request, data: previous?.data, error }))
      })

    return () => controller.abort()
  }, [request])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  const isCurrent = settled?.request === request
  return {
    data: settled?.data,
    error: isCurrent ? settled?.error : undefined,
    isLoading: !isCurrent && settled === undefined,
    isRefreshing: !isCurrent && settled !== undefined,
    reload,
  }
}
