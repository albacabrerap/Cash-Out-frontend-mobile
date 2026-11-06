import { Ionicons } from "@expo/vector-icons"
import { Pressable, Text, View } from "react-native"
import { Skeleton } from "@/components/ui/Skeleton"
import type { Movement } from "@/types/movements"
import { CATEGORY_META } from "@/utils/categories"
import { formatSoles } from "@/utils/format"
import { formatDayMonth } from "@/utils/movements"
import { useThemeColors } from "@/utils/theme"

interface MovementRowProps {
  movement: Movement
  onPress?: () => void
  onLongPress?: () => void
}

export function MovementRow({ movement, onPress, onLongPress }: MovementRowProps) {
  const colors = useThemeColors()
  const isIncome = movement.kind === "INCOME"
  const meta = movement.category ? CATEGORY_META[movement.category] : null
  const accent = isIncome ? colors.income : colors.series[meta?.seriesIndex ?? 6]
  const title = movement.label ?? (isIncome ? "Ingreso" : (meta?.label ?? "Gasto"))
  const subtitle = isIncome ? "Ingreso" : (meta?.label ?? "Gasto")

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      accessibilityRole={onPress || onLongPress ? "button" : undefined}
      accessibilityLabel={`${title}, ${isIncome ? "ingreso" : "gasto"} de ${formatSoles(movement.amount)}`}
      className="flex-row items-center gap-3 py-3 active:opacity-70"
    >
      <View
        style={{ backgroundColor: `${accent}26` }}
        className="h-11 w-11 items-center justify-center rounded-full"
      >
        <Ionicons name={isIncome ? "arrow-down-outline" : (meta?.icon ?? "shapes-outline")} size={20} color={accent} />
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-medium text-foreground">
          {title}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {subtitle} · {formatDayMonth(movement.date)}
        </Text>
      </View>
      <Text className={`text-base font-semibold ${isIncome ? "text-income" : "text-foreground"}`}>
        {isIncome ? "+" : "−"} {formatSoles(movement.amount)}
      </Text>
    </Pressable>
  )
}

export function MovementRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <Skeleton className="h-11 w-11 rounded-full" />
      <View className="flex-1 gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </View>
      <Skeleton className="h-4 w-16" />
    </View>
  )
}
