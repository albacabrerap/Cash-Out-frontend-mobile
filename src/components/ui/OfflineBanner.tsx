import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export function OfflineBanner() {
  const online = useOnlineStatus()
  const insets = useSafeAreaInsets()
  if (online) return null

  return (
    <View
      pointerEvents="none"
      accessibilityRole="alert"
      style={{ position: "absolute", top: insets.top + 4, left: 0, right: 0, alignItems: "center", zIndex: 10 }}
    >
      <View className="rounded-full border border-border bg-card px-4 py-1.5">
        <Text className="text-xs font-medium text-muted-foreground">Sin conexión: mostrando lo último que cargó</Text>
      </View>
    </View>
  )
}
