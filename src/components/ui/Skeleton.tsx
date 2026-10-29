import { useEffect, useRef } from "react"
import { Animated, View } from "react-native"

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  const opacity = useRef(new Animated.Value(0.45)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 800, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View style={{ opacity }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View className={`rounded-lg bg-muted ${className}`} />
    </Animated.View>
  )
}
