import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export function useAsyncAction<A extends unknown[], R>(action: (...args: A) => Promise<R>) {
  const actionRef = useRef(action)
  const running = useRef(false)
  const [isPending, setIsPending] = useState(false)

  useLayoutEffect(() => {
    actionRef.current = action
  })

  const run = useCallback(async (...args: A): Promise<R | undefined> => {
    if (running.current) return undefined
    running.current = true
    setIsPending(true)
    try {
      return await actionRef.current(...args)
    } finally {
      running.current = false
      setIsPending(false)
    }
  }, [])

  return { run, isPending }
}
