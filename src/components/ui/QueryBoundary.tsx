import type { ApiQuery } from "@/hooks/useApiQuery"
import type { ReactNode } from "react"
import { ErrorState } from "./ErrorState"

interface QueryBoundaryProps<T> {
  query: ApiQuery<T>
  skeleton: ReactNode
  isEmpty?: (data: T) => boolean
  empty?: ReactNode
  children: (data: T) => ReactNode
}

export function QueryBoundary<T>({ query, skeleton, isEmpty, empty, children }: QueryBoundaryProps<T>) {
  if (query.data === undefined) {
    return query.error ? <ErrorState error={query.error} onRetry={query.reload} /> : <>{skeleton}</>
  }
  if (isEmpty?.(query.data)) return <>{empty}</>
  return <>{children(query.data)}</>
}
