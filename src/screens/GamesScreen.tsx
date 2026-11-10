import { useRouter } from "expo-router"
import { RefreshControl, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MinigameCard } from "@/components/games/MinigameCard"
import { SessionHistory } from "@/components/games/SessionHistory"
import { EmptyState } from "@/components/ui/EmptyState"
import { QueryBoundary } from "@/components/ui/QueryBoundary"
import { Skeleton } from "@/components/ui/Skeleton"
import { useApiQuery } from "@/hooks/useApiQuery"
import { useErrorToast } from "@/hooks/useErrorToast"
import { useReloadOnFocus } from "@/hooks/useReloadOnFocus"
import { minigameService } from "@/services/minigameService"
import { walletService } from "@/services/walletService"
import { formatTokens } from "@/utils/format"
import { gameStats, mostPlayedTitle, sortByCost } from "@/utils/minigames"

function GameCardSkeleton() {
  return <Skeleton className="h-72 w-full rounded-2xl" />
}

export default function GamesScreen() {
  const router = useRouter()
  const games = useApiQuery(["minigames"], (signal) => minigameService.list(signal))
  const sessions = useApiQuery(["minigame-sessions"], (signal) => minigameService.sessions(signal))
  const wallet = useApiQuery(["wallet"], (signal) => walletService.get(signal))

  // Al volver de una partida cambian el saldo, los puntajes y el historial.
  const reloadAll = () => {
    games.reload()
    sessions.reload()
    wallet.reload()
  }
  useReloadOnFocus(reloadAll)
  useErrorToast(games.data !== undefined ? games.error : undefined)

  const balance = wallet.data?.tokenBalance
  const stats = gameStats(sessions.data ?? [])
  const mostPlayed = mostPlayedTitle(stats)
  const refreshing = games.isRefreshing || sessions.isRefreshing || wallet.isRefreshing

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-10 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reloadAll} />}
      >
        <View className="gap-2">
          <Text accessibilityRole="header" className="text-3xl font-semibold text-foreground">
            Juega y gana <Text className="text-accent-ink">fichas</Text>
          </Text>
          <Text className="text-base text-muted-foreground">
            Aprende de finanzas jugando y usa lo que ganes en el simulador de mercado.
          </Text>
          <View className="flex-row items-center gap-2 self-start rounded-full border border-border bg-card px-3.5 py-1.5">
            <Text className="text-sm text-muted-foreground">Tus fichas</Text>
            {balance !== undefined ? (
              <Text className="text-sm font-semibold text-foreground">{formatTokens(balance)}</Text>
            ) : wallet.error ? (
              <Text className="text-sm text-foreground">—</Text>
            ) : (
              <Skeleton className="h-4 w-20" />
            )}
          </View>
        </View>

        <Text accessibilityRole="header" className="text-xl font-semibold text-foreground">
          Juegos
        </Text>
        <QueryBoundary
          query={games}
          skeleton={
            <View className="gap-4">
              <GameCardSkeleton />
              <GameCardSkeleton />
            </View>
          }
          isEmpty={(list) => list.length === 0}
          empty={
            <EmptyState
              title="Todavía no hay juegos publicados"
              description="Cuando haya un juego disponible aparecerá aquí, con lo que cuesta y lo que puedes ganar."
            />
          }
        >
          {(list) => (
            <View className="gap-4">
              {sortByCost(list).map((game) => {
                const played = stats.get(game.title)
                return (
                  <MinigameCard
                    key={game.id}
                    game={game}
                    balance={balance}
                    stats={{ plays: played?.plays ?? 0, best: played ? played.best : null }}
                    featured={game.title === mostPlayed}
                    onPlay={() => router.push(`/games/${game.id}`)}
                  />
                )
              })}
            </View>
          )}
        </QueryBoundary>

        <SessionHistory sessions={sessions.data} error={sessions.error} onRetry={sessions.reload} />

        <View className="rounded-2xl border border-dashed border-border px-5 py-4">
          <Text className="text-[13px] leading-relaxed text-muted-foreground">
            <Text className="font-medium text-foreground">¿De dónde salen las fichas? </Text>
            Las ganas cumpliendo tus metas de ahorro y jugando. Sirven solo dentro de Cash-Out: nunca son dinero real.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
