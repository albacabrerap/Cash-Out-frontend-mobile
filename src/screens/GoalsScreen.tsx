import { RefreshControl, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { EmptyState } from "@/components/ui/EmptyState"
import { QueryBoundary } from "@/components/ui/QueryBoundary"
import { GoalCardSkeleton, GoalProgressCard } from "@/components/finance/GoalProgressCard"
import { useApiQuery } from "@/hooks/useApiQuery"
import { useErrorToast } from "@/hooks/useErrorToast"
import { useReloadOnFocus } from "@/hooks/useReloadOnFocus"
import { goalService } from "@/services/goalService"

export default function GoalsScreen() {
  const goals = useApiQuery(["goals"], (signal) => goalService.list(signal))

  useReloadOnFocus(goals.reload)
  useErrorToast(goals.data !== undefined ? goals.error : undefined)

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-4 px-5 pb-10 pt-4"
        refreshControl={<RefreshControl refreshing={goals.isRefreshing} onRefresh={goals.reload} />}
      >
        <Text accessibilityRole="header" className="text-3xl font-semibold text-foreground">
          Metas de ahorro
        </Text>

        <QueryBoundary
          query={goals}
          skeleton={
            <View className="gap-3">
              <GoalCardSkeleton />
              <GoalCardSkeleton />
              <GoalCardSkeleton />
            </View>
          }
          isEmpty={(list) => list.length === 0}
          empty={
            <EmptyState
              title="Todavía no tienes metas"
              description="Una meta te ayuda a separar dinero para algo concreto y a ver cuánto te falta."
            />
          }
        >
          {(list) => (
            <View className="gap-3">
              {list.map((goal) => (
                <GoalProgressCard key={goal.id} goal={goal} />
              ))}
            </View>
          )}
        </QueryBoundary>
      </ScrollView>
    </SafeAreaView>
  )
}
