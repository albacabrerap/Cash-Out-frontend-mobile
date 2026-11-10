import { Ionicons } from "@expo/vector-icons"
import { Text, View } from "react-native"
import type { OrderStatus, TradeOrder } from "@/types/portfolio"
import { formatQuantity, formatServerDate, formatTokenAmount } from "@/utils/format"
import { useThemeColors } from "@/utils/theme"

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  EXECUTED: { label: "Ejecutada", className: "text-success" },
  PENDING: { label: "Pendiente", className: "text-warning" },
  REJECTED: { label: "Rechazada", className: "text-destructive" },
  CANCELLED: { label: "Cancelada", className: "text-muted-foreground" },
}

export function OrderRow({ order }: { order: TradeOrder }) {
  const colors = useThemeColors()
  const isBuy = order.side === "BUY"
  const status = STATUS[order.status]
  const accent = isBuy ? colors.income : colors.expense

  return (
    <View
      accessible
      accessibilityLabel={`${isBuy ? "Compra" : "Venta"} de ${formatQuantity(order.quantity)} ${order.symbol}, ${status.label.toLowerCase()}`}
      className="flex-row items-center gap-3 py-3"
    >
      <View style={{ backgroundColor: `${accent}26` }} className="h-11 w-11 items-center justify-center rounded-full">
        <Ionicons name={isBuy ? "arrow-down-outline" : "arrow-up-outline"} size={20} color={accent} />
      </View>

      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-medium text-foreground">
          {isBuy ? "Compra" : "Venta"} · {order.symbol}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted-foreground">
          {formatQuantity(order.quantity)} u. · {formatServerDate(order.executedAt ?? order.createdAt)}
        </Text>
        {order.status === "REJECTED" && order.rejectionReason ? (
          <Text className="text-sm text-destructive">{order.rejectionReason}</Text>
        ) : null}
      </View>

      <View className="items-end">
        <Text className="text-base font-semibold text-foreground">
          {order.tokensMoved != null ? formatTokenAmount(order.tokensMoved) : "—"}
        </Text>
        <Text className={`text-sm ${status.className}`}>{status.label}</Text>
      </View>
    </View>
  )
}
