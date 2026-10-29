import type { ComponentProps } from "react"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { useThemeColors } from "@/utils/theme"

type IconName = ComponentProps<typeof Ionicons>["name"]

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Inicio", icon: "home-outline" },
  { name: "movements", title: "Movimientos", icon: "swap-vertical-outline" },
  { name: "goals", title: "Metas", icon: "flag-outline" },
  { name: "profile", title: "Perfil", icon: "person-outline" },
]

export default function TabsLayout() {
  const colors = useThemeColors()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  )
}
