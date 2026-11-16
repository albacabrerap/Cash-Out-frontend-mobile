import { useShake } from "@/hooks/useShake"
import { router, Stack } from "expo-router"

export default function AppLayout() {
  useShake(() => {
    router.navigate("/games")
  })
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new-order" options={{ presentation: "modal" }} />
    </Stack>
  )
}
