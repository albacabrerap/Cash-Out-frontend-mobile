import "../global.css"
import { useEffect } from "react"
import { Text, View } from "react-native"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Button } from "@/components/ui/Button"
import { AuthProvider } from "@/contexts/AuthProvider"
import { useAuth } from "@/hooks/useAuth"

// splash hasta encontrar sesiones guardadas
SplashScreen.preventAutoHideAsync()


function RootNavigator() {
  const { status, retryRestore } = useAuth()

  useEffect(() => {
    if (status !== "restoring") void SplashScreen.hideAsync()
  }, [status])

  if (status === "restoring") return null

  if (status === "unavailable") {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Text className="text-center text-xl font-semibold text-foreground">No pudimos conectar</Text>
        <Text className="text-center text-base text-muted-foreground">
          Tu sesión sigue guardada. Revisa tu conexión e inténtalo de nuevo.
        </Text>
        <View className="w-full">
          <Button label="Reintentar" onPress={retryRestore} />
        </View>
      </View>
    )
  }

  const signedIn = status === "authenticated"
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
