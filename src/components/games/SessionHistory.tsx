import { Text, View } from "react-native"
import type { ApiError } from "@/api/errors"
import { Card } from "@/components/ui/Card"
import { ErrorState } from "@/components/ui/ErrorState"
import { Skeleton } from "@/components/ui/Skeleton"
import type { MinigameSession } from "@/types/minigames"
import { formatServerDate, formatTokens } from "@/utils/format"
import { formatSignedTokens } from "@/utils/minigames"

interface SessionHistoryProps {
  /** undefined mientras cargan. */
  sessions: MinigameSession[] | undefined
  error: ApiError | undefined
  onRetry: () => void
}

/** Cada partida con lo que dejó en fichas, de la más reciente a la más antigua. */
export function SessionHistory({ sessions, error, onRetry }: SessionHistoryProps) {
  return (
    <Card className="gap-1">
      <Text accessibilityRole="header" className="pb-1 text-lg font-semibold text-foreground">
        Tus partidas
      </Text>

      {error && !sessions ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !sessions ? (
        <View className="gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </View>
      ) : sessions.length === 0 ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          Todavía no jugaste. Tus partidas aparecerán aquí.
        </Text>
      ) : (
        sessions.map((session) => {
          const net = session.tokensEarned - session.tokensSpent
          return (
            <View
              key={session.id}
              className="flex-row items-center justify-between gap-3 border-t border-border py-2.5"
            >
              <View className="flex-1">
                <Text numberOfLines={1} className="text-sm font-medium text-foreground">
                  {session.minigameTitle}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {formatServerDate(session.playedAt)} · {session.score} / 100
                </Text>
              </View>
              <View className="items-end">
                <Text className={`text-sm font-medium ${net > 0 ? "text-gain" : net < 0 ? "text-loss" : "text-foreground"}`}>
                  {formatSignedTokens(net)}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {session.tokensSpent === 0 ? "Gratis" : `Costó ${formatTokens(session.tokensSpent)}`}
                </Text>
              </View>
            </View>
          )
        })
      )}
    </Card>
  )
}
