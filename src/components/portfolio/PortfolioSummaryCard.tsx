import { Text, View } from "react-native"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import type { TokenWallet } from "@/types/finance"
import type { Portfolio } from "@/types/portfolio"
import { formatPercent, formatSignedTokens, formatTokenAmount, formatTokens } from "@/utils/format"
import { pnlTextClass } from "./pnl"

interface PortfolioSummaryCardProps {
  portfolio: Portfolio
  /** Puede faltar si /token-wallet fallo: la cartera se muestra igual. */
  wallet: TokenWallet | undefined
}

export function PortfolioSummaryCard({ portfolio, wallet }: PortfolioSummaryCardProps) {
  const { simulatedValue, investedTokens, unrealizedPnl, realizedPnl } = portfolio
  const returnPercent = investedTokens > 0 ? (unrealizedPnl / investedTokens) * 100 : null

  return (
    <Card className="gap-4">
      <View className="gap-1">
        <Text className="text-sm text-muted-foreground">Valor de tu cartera</Text>
        <Text
          accessibilityLabel={`Valor de tu cartera: ${formatTokens(simulatedValue)}`}
          className="text-4xl font-semibold text-foreground"
        >
          {formatTokenAmount(simulatedValue)}
          <Text className="text-base font-normal text-muted-foreground"> fichas</Text>
        </Text>
        <Text className={`text-sm font-medium ${pnlTextClass(unrealizedPnl)}`}>
          {formatSignedTokens(unrealizedPnl)} ({formatPercent(returnPercent)}) frente a lo invertido
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-y-3 border-t border-border pt-3">
        <Stat label="Invertido" value={formatTokenAmount(investedTokens)} />
        <Stat label="Disponible" value={wallet ? formatTokenAmount(wallet.tokenBalance) : "—"} />
        <Stat
          label="Realizado"
          value={formatSignedTokens(realizedPnl)}
          valueClass={pnlTextClass(realizedPnl)}
        />
      </View>
    </Card>
  )
}

function Stat({ label, value, valueClass = "text-foreground" }: { label: string; value: string; valueClass?: string }) {
  return (
    <View className="w-1/3 gap-0.5 pr-2">
      <Text numberOfLines={1} className="text-xs text-muted-foreground">
        {label}
      </Text>
      <Text numberOfLines={1} adjustsFontSizeToFit className={`text-base font-medium ${valueClass}`}>
        {value}
      </Text>
    </View>
  )
}

export function PortfolioSummarySkeleton() {
  return (
    <Card className="gap-4">
      <View className="gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-56" />
      </View>
      <View className="flex-row gap-6 border-t border-border pt-3">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </View>
    </Card>
  )
}
