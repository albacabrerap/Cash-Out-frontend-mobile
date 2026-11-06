import { useEffect, useState } from "react"

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  const key = JSON.stringify(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(JSON.parse(key) as T), delay)
    return () => clearTimeout(timer)

  }, [key, delay])

  return debounced
}
