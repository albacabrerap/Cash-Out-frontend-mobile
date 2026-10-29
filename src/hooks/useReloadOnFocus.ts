import { useFocusEffect } from "expo-router"
import { useCallback, useRef } from "react"


export function useReloadOnFocus(reload: () => void) {
  const first = useRef(true)

  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false
        return
      }
      reload()
    }, [reload]),
  )
}
