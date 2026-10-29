import { Text, View } from "react-native"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import type { Savings } from "@/types/finance"
import { formatSoles } from "@/utils/format"

export function SavingsSummaryCard({ savings }: { savings: Savings }) {
  return (
    <Card className="gap-4">
      <View className="gap-1">
        <Text className="text-sm text-muted-foreground">Disponible para gastar</Text>
        <Text className="text-4xl font-semibold text-foreground">{formatSoles(savings.availableBalance)}</Text>
      </View>
      <View className="flex-row gap-6 border-t border-border pt-3">
        <View className="gap-0.5">
          <Text className="text-xs text-muted-foreground">Saldo total</Text>
          <Text className="text-base font-medium text-foreground">{formatSoles(savings.currentBalance)}</Text>
        </View>
        <View className="gap-0.5">
          <Text className="text-xs text-muted-foreground">En tus metas</Text>
          <Text className="text-base font-medium text-foreground">{formatSoles(savings.committedAmount)}</Text>
        </View>
      </View>
    </Card>
  )
}

export function SavingsSummarySkeleton() {
  return (
    <Card className="gap-4">
      <View className="gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-52" />
      </View>
      <View className="flex-row gap-6 border-t border-border pt-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </View>
    </Card>
  )
}
