import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Notice } from "@/components/ui/Notice"
import { USE_MOCKS } from "@/config"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { useAuth } from "@/hooks/useAuth"
import { initials } from "@/utils/format"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { run: signOut, isPending } = useAsyncAction(logout)

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 gap-6 px-5 pt-4">
        <Text accessibilityRole="header" className="text-3xl font-semibold text-foreground">
          Perfil
        </Text>

        {USE_MOCKS && <Notice>Modo demo ! Son datos de mocks</Notice>}

        <Card className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Text className="text-lg font-semibold text-accent-foreground">{user ? initials(user.name) : "?"}</Text>
          </View>
          <View className="flex-1">
            <Text numberOfLines={1} className="text-lg font-semibold text-foreground">
              {user?.name}
            </Text>
            <Text numberOfLines={1} className="text-sm text-muted-foreground">
              {user?.email}
            </Text>
          </View>
        </Card>

        <Button label="Cerrar sesión" variant="outline" loading={isPending} onPress={() => void signOut()} />
      </View>
    </SafeAreaView>
  )
}
