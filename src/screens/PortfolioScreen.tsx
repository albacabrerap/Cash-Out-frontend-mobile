import { AllocationBar } from "@/components/portfolio/AllocationBar"
import { OrderRow } from "@/components/portfolio/OrderRow"
import { PortfolioSummaryCard, PortfolioSummarySkeleton } from "@/components/portfolio/PortfolioSummaryCard"
import { PositionRow, PositionRowSkeleton } from "@/components/portfolio/PositionRow"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { QueryBoundary } from "@/components/ui/QueryBoundary"
import { Section } from "@/components/ui/Section"
import { useApiQuery } from "@/hooks/useApiQuery"
import { useErrorToast } from "@/hooks/useErrorToast"
import { useReloadOnFocus } from "@/hooks/useReloadOnFocus"
import { orderService, portfolioService, walletService } from "@/services/portfolioService"
import type { Position } from "@/types/portfolio"
import { useRouter } from "expo-router"
import { useCallback } from "react"
import { RefreshControl, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function PortfolioScreen() {
  const router = useRouter()

  const portfolio = useApiQuery(["portfolio"], (signal) => portfolioService.get(signal))
  // Secundarios: si fallan, la cartera se muestra igual.
  const wallet = useApiQuery(["token-wallet"], (signal) => walletService.get(signal))
  const orders = useApiQuery(["orders", "recent"], (signal) => orderService.list({ page: 0, size: 5 }, signal))

  const reloadAll = useCallback(() => {
    portfolio.reload()
    wallet.reload()
    orders.reload()
  }, [portfolio.reload, wallet.reload, orders.reload])

  // Al volver de una orden se recarga todo: cambiaron posiciones, fichas e historial.
  useReloadOnFocus(reloadAll)
  useErrorToast(portfolio.data !== undefined ? portfolio.error : undefined)
  useErrorToast(orders.data !== undefined ? orders.error : undefined)

  const refreshing = portfolio.isRefreshing || wallet.isRefreshing || orders.isRefreshing

  const openOrder = (position?: Position) =>
    router.push(
      position
        ? {
            pathname: "/new-order",
            params: { assetId: String(position.assetId), symbol: position.symbol, name: position.assetName },
          }
        : "/new-order",
    )

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-7 px-5 pb-10 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reloadAll} />}
      >
        <View className="gap-0.5">
          <Text accessibilityRole="header" className="text-3xl font-semibold text-foreground">
            Mi portafolio
          </Text>
          <Text className="text-sm text-muted-foreground">Invierte con fichas, sin arriesgar tu sueldo.</Text>
        </View>

        <QueryBoundary query={portfolio} skeleton={<PortfolioSummarySkeleton />}>
          {(data) => (
            <View className="gap-4">
              <PortfolioSummaryCard portfolio={data} wallet={wallet.data} />
              <Button label="Nueva orden" onPress={() => openOrder()} />
            </View>
          )}
        </QueryBoundary>

        <QueryBoundary
          query={portfolio}
          skeleton={
            <View>
              <PositionRowSkeleton />
              <PositionRowSkeleton />
              <PositionRowSkeleton />
            </View>
          }
          isEmpty={(data) => data.positions.length === 0}
          empty={
            <EmptyState
              title="Todavía no inviertes"
              description="Usa tus fichas para comprar tu primer activo y mira cómo cambia su valor."
              actionLabel="Comprar mi primer activo"
              onAction={() => openOrder()}
            />
          }
        >
          {(data) => (
            <View className="gap-7">
              <Section title="Distribución">
                <AllocationBar positions={data.positions} />
              </Section>

              <Section title="Tus posiciones">
                <View>
                  {data.positions.map((position) => (
                    <PositionRow key={position.id} position={position} onPress={() => openOrder(position)} />
                  ))}
                </View>
              </Section>
            </View>
          )}
        </QueryBoundary>

        {orders.data && orders.data.content.length > 0 && (
          <Section title="Órdenes recientes">
            <View>
              {orders.data.content.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </View>
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
