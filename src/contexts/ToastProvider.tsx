import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Animated, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ToastContext, type ToastApi } from "./toastContext"

type Tone = "success" | "error"

const VISIBLE_MS = 3200

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const [toast, setToast] = useState<{ tone: Tone; message: string } | null>(null)
  const progress = useRef(new Animated.Value(0)).current
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback(
    (tone: Tone, message: string) => {
      clearTimeout(timer.current)
      setToast({ tone, message })
      Animated.timing(progress, { toValue: 1, duration: 180, useNativeDriver: true }).start()
      timer.current = setTimeout(() => {
        Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null))
      }, VISIBLE_MS)
    },
    [progress],
  )

  useEffect(() => () => clearTimeout(timer.current), [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show("success", message),
      error: (message) => show("error", message),
    }),
    [show],
  )

  return (
    <ToastContext value={api}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: insets.top + 8,
            left: 16,
            right: 16,
            opacity: progress,
            transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
          }}
        >
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            className={`rounded-xl border bg-card px-4 py-3 ${toast.tone === "success" ? "border-success" : "border-destructive"}`}
          >
            <Text className={`text-sm font-medium ${toast.tone === "success" ? "text-success" : "text-destructive"}`}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext>
  )
}
