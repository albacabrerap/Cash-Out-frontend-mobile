import { Text, View } from "react-native"
import { Card } from "@/components/ui/Card"
import type { Position } from "@/types/portfolio"
import { formatPercent, formatTokenAmount } from "@/utils/format"
import { useThemeColors } from "@/utils/theme"

/** Mas tajadas que esto se agrupan en "Otros" para que la barra siga siendo legible. */
const MAX_SLICES = 5

interface Slice {
  label: string
  value: number
  share: number
  color: string
}

/**
 * Distribucion de la cartera por valor de mercado, como una barra apilada.
 * Con Views y no con un grafico: no hace falta agregar react-native-svg.
 */
export function AllocationBar({ positions }: { positions: Position[] }) {
  const colors = useThemeColors()

  const valued = positions
    .map((position) => ({ label: position.symbol, value: position.marketValue ?? 0 }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = valued.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return null

  const head = valued.slice(0, MAX_SLICES)
  const rest = valued.slice(MAX_SLICES).reduce((sum, item) => sum + item.value, 0)
  const grouped = rest > 0 ? [...head, { label: "Otros", value: rest }] : head

  const slices: Slice[] = grouped.map((item, index) => ({
    ...item,
    share: item.value / total,
    color: colors.series[index % colors.series.length],
  }))

  return (
    <Card className="gap-4">
      <View
        accessible
        accessibilityLabel={`Distribución: ${slices.map((s) => `${s.label} ${formatPercent(s.share * 100).replace("+", "")}`).join(", ")}`}
        className="h-3 flex-row gap-0.5 overflow-hidden rounded-full"
      >
        {slices.map((slice) => (
          <View key={slice.label} style={{ flex: slice.share, backgroundColor: slice.color }} />
        ))}
      </View>

      <View className="gap-2.5" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {slices.map((slice) => (
          <View key={slice.label} className="flex-row items-center gap-2.5">
            <View style={{ backgroundColor: slice.color }} className="h-2.5 w-2.5 rounded-sm" />
            <Text className="flex-1 text-sm font-medium text-foreground">{slice.label}</Text>
            <Text className="text-sm text-muted-foreground">{formatTokenAmount(slice.value)}</Text>
            <Text className="w-16 text-right text-sm font-medium text-foreground">
              {formatPercent(slice.share * 100).replace("+", "")}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  )
}
