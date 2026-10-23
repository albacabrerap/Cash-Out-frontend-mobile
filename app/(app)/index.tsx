import { Button } from "@/components/ui/Button"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { useAuth } from "@/hooks/useAuth"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

/**
 * Pantalla provisional
 */
export default function HomeScreen() {
  const { user, logout } = useAuth()
  const { run: signOut, isPending } = useAsyncAction(logout)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-1">
          <Text className="text-3xl font-semibold text-foreground">Hola, {user?.name}</Text>
          <Text className="text-base text-muted-foreground">{user?.email}</Text>
        </View>
        <Text className="text-base text-foreground">
          la sesion funciona
        </Text>
        <Button label="Cerrar sesión" variant="outline" loading={isPending} onPress={() => void signOut()} />
      </View>
    </SafeAreaView>
  )
}
