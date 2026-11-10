import { Pressable, Text, View } from "react-native"
import { Skeleton } from "@/components/ui/Skeleton"
import type { Position } from "@/types/portfolio"
import { formatPercent, formatQuantity, formatSignedTokens, formatTokenAmount } from "@/utils/format"
import { pnlTextClass } from "./pnl"

interface PositionRowProps {
  position: Position
  onPress?: () => void
}

export function PositionRow({ position, onPress }: PositionRowProps) {
  const { symbol, assetName, quantity, averageCost, currentPrice, marketValue, unrealizedPnl } = position
  const cost = averageCost * quantity
  const pnlPercent = unrealizedPnl != null && cost > 0 ? (unrealizedPnl / cost) * 100 : null

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${symbol}, ${formatQuantity(quantity)} unidades, vale ${formatTokenAmount(marketValue)} fichas, ganancia ${formatSignedTokens(unrealizedPnl)}`}
      accessibilityHint={onPress ? "Abre una orden de compra o venta" : undefined}
      className="flex-row items-center gap-3 py-3 active:opacity-70"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Text numberOfLines={1} adjustsFontSizeToFit className="px-1 text-xs font-semibold text-foreground">
          {symbol.split("-")[0].slice(0, 4)}
        </Text>
      </View>

      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-medium text-foreground">
          {symbol}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted-foreground">
          {currentPrice == null
            ? `${assetName} · sin precio`
            : `${formatQuantity(quantity)} × ${formatTokenAmount(currentPrice)}`}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-base font-semibold text-foreground">{formatTokenAmount(marketValue)}</Text>
        <Text className={`text-sm ${pnlTextClass(unrealizedPnl)}`}>
          {formatSignedTokens(unrealizedPnl)} · {formatPercent(pnlPercent)}
        </Text>
      </View>
    </Pressable>
  )
}

export function PositionRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <Skeleton className="h-11 w-11 rounded-full" />
      <View className="flex-1 gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-28" />
      </View>
      <View className="items-end gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </View>
    </View>
  )
}
