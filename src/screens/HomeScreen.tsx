import { GoalCardSkeleton, GoalProgressCard } from "@/components/finance/GoalProgressCard"
import { MovementRow, MovementRowSkeleton } from "@/components/finance/MovementRow"
import { SavingsSummaryCard, SavingsSummarySkeleton } from "@/components/finance/SavingsSummaryCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { QueryBoundary } from "@/components/ui/QueryBoundary"
import { Section } from "@/components/ui/Section"
import { useApiQuery } from "@/hooks/useApiQuery"
import { useAuth } from "@/hooks/useAuth"
import { useErrorToast } from "@/hooks/useErrorToast"
import { useReloadOnFocus } from "@/hooks/useReloadOnFocus"
import { goalService } from "@/services/goalService"
import { movementService } from "@/services/movementService"
import { savingsService } from "@/services/savingsService"
import { firstName } from "@/utils/format"
import { movementKey } from "@/utils/movements"
import { useRouter } from "expo-router"
import { useCallback } from "react"
import { RefreshControl, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const savings = useApiQuery(["savings"], (signal) => savingsService.get(signal))
  const recent = useApiQuery(["movements", "recent"], (signal) =>
    movementService.list({ page: 0, size: 5, sort: "date,desc" }, signal),
  )
  const goals = useApiQuery(["goals"], (signal) => goalService.list(signal))

  const reloadAll = useCallback(() => {
    savings.reload()
    recent.reload()
    goals.reload()
  }, [savings.reload, recent.reload, goals.reload])

  useReloadOnFocus(reloadAll)
  useErrorToast(savings.data !== undefined ? savings.error : undefined)
  useErrorToast(recent.data !== undefined ? recent.error : undefined)
  useErrorToast(goals.data !== undefined ? goals.error : undefined)

  const refreshing = savings.isRefreshing || recent.isRefreshing || goals.isRefreshing

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-7 px-5 pb-10 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reloadAll} />}
      >
        <View className="gap-0.5">
          <Text className="text-sm text-muted-foreground">Hola de nuevo</Text>
          <Text accessibilityRole="header" className="text-3xl font-semibold text-foreground">
            {user ? firstName(user.name) : ""}
          </Text>
        </View>

        <QueryBoundary query={savings} skeleton={<SavingsSummarySkeleton />}>
          {(data) => <SavingsSummaryCard savings={data} />}
        </QueryBoundary>

        <Section title="Tus metas" actionLabel="Ver todas" onAction={() => router.push("/goals")}>
          <QueryBoundary
            query={goals}
            skeleton={<GoalCardSkeleton />}
            isEmpty={(list) => list.every((goal) => goal.status !== "IN_PROGRESS")}
            empty={
              <EmptyState
                title="Sin metas en curso"
                description="Crea una meta de ahorro y ve cuánto te falta para lograrla."
              />
            }
          >
            {(list) => (
              <View className="gap-3">
                {list
                  .filter((goal) => goal.status === "IN_PROGRESS")
                  .slice(0, 2)
                  .map((goal) => (
                    <GoalProgressCard key={goal.id} goal={goal} />
                  ))}
              </View>
            )}
          </QueryBoundary>
        </Section>

        <Section title="Últimos movimientos" actionLabel="Ver todos" onAction={() => router.push("/movements")}>
          <QueryBoundary
            query={recent}
            skeleton={
              <View>
                <MovementRowSkeleton />
                <MovementRowSkeleton />
                <MovementRowSkeleton />
              </View>
            }
            isEmpty={(page) => page.content.length === 0}
            empty={
              <EmptyState
                title="Aún no registras movimientos"
                description="Anota tu primer ingreso o gasto para empezar a ver tu panorama."
                actionLabel="Registrar movimiento"
                onAction={() => router.push("/new-movement")}
              />
            }
          >
            {(page) => (
              <View>
                {page.content.map((movement) => (
                  <MovementRow key={movementKey(movement)} movement={movement} />
                ))}
              </View>
            )}
          </QueryBoundary>
        </Section>
      </ScrollView>
    </SafeAreaView>
  )
}
