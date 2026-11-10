import { Text, View } from "react-native"
import { Button } from "@/components/ui/Button"
import type { Minigame } from "@/types/minigames"
import { formatTokens } from "@/utils/format"
import { MINIGAME_TYPE_LABEL, packFor, packLength } from "@/utils/minigames"
import { GameThumb } from "./GameThumb"

interface MinigameCardProps {
  game: Minigame
  /** Saldo de fichas; undefined mientras carga. */
  balance: number | undefined
  /** Cuántas veces se jugó y el mejor puntaje, si se jugó. */
  stats: { plays: number; best: number | null }
  featured: boolean
  onPlay: () => void
}

/** Un juego como un plan: lo que cuesta, lo que paga y tu mejor resultado. */
export function MinigameCard({ game, balance, stats, featured, onPlay }: MinigameCardProps) {
  const pack = packFor(game)
  const missing = balance === undefined ? 0 : game.tokenCost - balance

  return (
    <View
      className={`gap-3 rounded-2xl border bg-card p-4 ${featured ? "border-accent-ink" : "border-border"}`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          {MINIGAME_TYPE_LABEL[game.type]}
          {pack && ` · ${packLength(pack)}`}
        </Text>
        {featured && (
          <Text className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-ink">Más jugado</Text>
        )}
      </View>

      <View className="flex-row items-center gap-3">
        <GameThumb id={game.id} title={game.title} size="sm" />
        <Text accessibilityRole="header" className="flex-1 text-lg font-semibold leading-tight text-foreground">
          {game.title}
        </Text>
      </View>

      <Text className="text-sm text-muted-foreground">
        {pack ? pack.description : "Este juego todavía no se puede jugar en la app."}
      </Text>

      <View>
        <Text className="text-xs text-muted-foreground">Ganas hasta</Text>
        <Text className="text-2xl font-semibold text-gain">{formatTokens(game.maxTokenReward)}</Text>
      </View>

      <View className="gap-1.5 border-t border-border pt-3">
        <Row label="Entrada" value={game.tokenCost === 0 ? "Gratis" : formatTokens(game.tokenCost)} strong />
        <Row label="Tu mejor puntaje" value={stats.best === null ? "—" : `${stats.best} / 100`} />
        <Row label="Partidas" value={String(stats.plays)} />
      </View>

      {pack && missing > 0 && (
        <Text className="text-xs text-muted-foreground">Te faltan {formatTokens(missing)} para jugar.</Text>
      )}

      {pack ? (
        <Button label="Jugar" variant={featured ? "primary" : "outline"} onPress={onPlay} />
      ) : (
        <Button label="Pronto" variant="outline" onPress={onPlay} disabled />
      )}
    </View>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className={`text-sm text-foreground ${strong ? "font-medium" : ""}`}>{value}</Text>
    </View>
  )
}
