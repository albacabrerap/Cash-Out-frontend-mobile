import { ActivityIndicator, Text, View } from "react-native"
import { userMessage, type ApiError } from "@/api/errors"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Notice } from "@/components/ui/Notice"
import type { MinigameSession } from "@/types/minigames"
import { formatTokens } from "@/utils/format"
import { formatSignedTokens } from "@/utils/minigames"
import { GameFact } from "./GameFact"

export type SaveState =
  | { status: "saving" }
  | { status: "saved"; session: MinigameSession }
  | { status: "error"; error: ApiError }

interface GameResultProps {
  correct: number
  total: number
  score: number
  save: SaveState
  /** Saldo ya actualizado; undefined mientras se vuelve a pedir. */
  balance: number | undefined
  onRetry: () => void
  onPlayAgain: () => void
  onExit: () => void
}

function verdict(score: number): string {
  if (score >= 90) return "¡Excelente!"
  if (score >= 60) return "Bien jugado."
  return "Puedes volver a intentarlo cuando quieras."
}

export function GameResult({ correct, total, score, save, balance, onRetry, onPlayAgain, onExit }: GameResultProps) {
  return (
    <Card className="gap-4">
      <View className="gap-1">
        <Text accessibilityRole="header" className="text-xl font-semibold text-foreground">
          Tu puntaje: {score} de 100
        </Text>
        <Text className="text-base text-muted-foreground">
          Acertaste {correct} de {total}. {verdict(score)}
        </Text>
      </View>

      {save.status === "saving" && (
        <View accessibilityRole="progressbar" className="flex-row items-center gap-2">
          <ActivityIndicator />
          <Text className="text-sm text-muted-foreground">Registrando tu partida…</Text>
        </View>
      )}
      {save.status === "error" && <Notice tone="error">{`No pudimos registrar tu partida. ${userMessage(save.error)}`}</Notice>}
      {save.status === "saved" && <SessionTokens session={save.session} balance={balance} />}

      <View className="gap-2">
        {save.status === "error" && save.error.retryable && <Button label="Reintentar" onPress={onRetry} />}
        <Button
          label="Jugar otra vez"
          variant={save.status === "saved" ? "primary" : "outline"}
          onPress={onPlayAgain}
          disabled={save.status === "saving"}
        />
        <Button label="Ver todos los juegos" variant="outline" onPress={onExit} />
      </View>
    </Card>
  )
}

function SessionTokens({ session, balance }: { session: MinigameSession; balance: number | undefined }) {
  const net = session.tokensEarned - session.tokensSpent
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <GameFact
          label="Costo"
          value={session.tokensSpent === 0 ? "Gratis" : formatSignedTokens(-session.tokensSpent)}
          tone={session.tokensSpent > 0 ? "loss" : undefined}
        />
        <GameFact
          label="Ganaste"
          value={formatSignedTokens(session.tokensEarned)}
          tone={session.tokensEarned > 0 ? "gain" : undefined}
        />
      </View>
      <GameFact label="Resultado" value={formatSignedTokens(net)} tone={net > 0 ? "gain" : net < 0 ? "loss" : undefined} />
      {balance !== undefined && (
        <Text className="text-sm text-muted-foreground">Ahora tienes {formatTokens(balance)}.</Text>
      )}
    </View>
  )
}
