import { useEffect, useLayoutEffect, useRef } from "react"
import { AppState, type AppStateStatus } from "react-native"


export function usePolling(callback: () => void, intervalMs: number, enabled = true) {
  const callbackRef = useRef(callback)
  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!enabled) return
    let timer: ReturnType<typeof setInterval> | undefined

    const start = () => {
      clearInterval(timer)
      timer = setInterval(() => callbackRef.current(), intervalMs)
    }
    const onChange = (state: AppStateStatus) => {
      if (state === "active") {
        callbackRef.current()
        start()
      } else {
        clearInterval(timer)
      }
    }

    if (AppState.currentState === "active") start()
    const subscription = AppState.addEventListener("change", onChange)
    return () => {
      clearInterval(timer)
      subscription.remove()
    }
  }, [intervalMs, enabled])
}
