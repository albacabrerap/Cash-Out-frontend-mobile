import { toApiError, type ApiError } from "@/api/errors"
import type { PageResponse } from "@/types/api"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

interface ListState<T> {
  items: T[]
  nextPage: number
  hasMore: boolean
  phase: "loading" | "refreshing" | "ready" | "error"
  error?: ApiError
}

export interface PaginatedList<T> {
  items: T[]
  /** Primera carga */
  isLoading: boolean
  /** Recargando la primera pagina con datos previos visibles. */
  isRefreshing: boolean
  isLoadingMore: boolean
  hasMore: boolean
  /** Error de la carga inicial o de la recarga. */
  error: ApiError | undefined
  /** Error al pedir mas paginas; los datos ya cargados se conservan. */
  loadMoreError: ApiError | undefined
  loadMore(): void
  reload(): void
}


export function usePaginatedList<T>(
  fetchPage: (page: number, signal: AbortSignal) => Promise<PageResponse<T>>,
  deps: readonly unknown[],
): PaginatedList<T> {
  const key = JSON.stringify(deps)
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState<ListState<T>>({ items: [], nextPage: 0, hasMore: true, phase: "loading" })
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<ApiError>()

  const fetchRef = useRef(fetchPage)
  useLayoutEffect(() => {
    fetchRef.current = fetchPage
  })
  const moreController = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    moreController.current?.abort()
    setIsLoadingMore(false)
    setLoadMoreError(undefined)
    setState((previous) => ({
      ...previous,
      phase: previous.items.length > 0 ? "refreshing" : "loading",
      error: undefined,
    }))

    fetchRef
      .current(0, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return
        setState({ items: page.content, nextPage: 1, hasMore: page.page + 1 < page.totalPages, phase: "ready" })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const error = toApiError(err)
        if (!error.isCanceled) setState((previous) => ({ ...previous, phase: "error", error }))
      })

    return () => controller.abort()
  }, [key, nonce])

  const loadMore = useCallback(() => {
    if (!state.hasMore || state.phase !== "ready" || isLoadingMore) return
    const controller = new AbortController()
    moreController.current = controller
    setIsLoadingMore(true)
    setLoadMoreError(undefined)

    fetchRef
      .current(state.nextPage, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return
        setState((previous) => ({
          ...previous,
          items: [...previous.items, ...page.content],
          nextPage: previous.nextPage + 1,
          hasMore: page.page + 1 < page.totalPages,
        }))
        setIsLoadingMore(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setLoadMoreError(toApiError(err))
        setIsLoadingMore(false)
      })
  }, [state.hasMore, state.nextPage, state.phase, isLoadingMore])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  return {
    items: state.items,
    isLoading: state.phase === "loading",
    isRefreshing: state.phase === "refreshing",
    isLoadingMore,
    hasMore: state.hasMore,
    error: state.phase === "error" ? state.error : undefined,
    loadMoreError,
    loadMore,
    reload,
  }
}
