import { Text, View } from "react-native"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import type { GoalStatus, SavingsGoal } from "@/types/goals"
import { formatDate, formatSoles } from "@/utils/format"

const STATUS_LABEL: Record<GoalStatus, string> = {
  IN_PROGRESS: "En curso",
  COMPLETED: "Cumplida",
  EXPIRED: "Vencida",
}

export function GoalProgressCard({ goal }: { goal: SavingsGoal }) {
  const done = goal.status === "COMPLETED"
  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text numberOfLines={1} className="flex-1 text-lg font-semibold text-foreground">
          {goal.name}
        </Text>
        <Text className={`text-xs font-medium ${done ? "text-success" : goal.status === "EXPIRED" ? "text-destructive" : "text-muted-foreground"}`}>
          {STATUS_LABEL[goal.status]}
        </Text>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(goal.progressPercent) }}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <View style={{ width: `${goal.progressPercent}%` }} className={`h-2 rounded-full ${done ? "bg-success" : "bg-primary"}`} />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-foreground">
          {formatSoles(goal.accumulatedAmount)} <Text className="text-muted-foreground">de {formatSoles(goal.targetAmount)}</Text>
        </Text>
        <Text className="text-sm text-muted-foreground">{done ? "Lista" : `Hasta ${formatDate(goal.deadline)}`}</Text>
      </View>
    </Card>
  )
}

export function GoalCardSkeleton() {
  return (
    <Card className="gap-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-4 w-48" />
    </Card>
  )
}
