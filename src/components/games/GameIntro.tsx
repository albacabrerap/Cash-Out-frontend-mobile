import { Text, View } from "react-native"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Notice } from "@/components/ui/Notice"
import type { GamePack } from "@/games/types"
import type { ApiQuery } from "@/hooks/useApiQuery"
import type { TokenWallet } from "@/types/finance"
import type { Minigame } from "@/types/minigames"
import { formatTokens } from "@/utils/format"
import { GameFact } from "./GameFact"

interface GameIntroProps {
  game: Minigame
  pack: GamePack
  wallet: ApiQuery<TokenWallet>
  onStart: () => void
}

export function GameIntro({ game, pack, wallet, onStart }: GameIntroProps) {
  const balance = wallet.data?.tokenBalance
  const missing = balance === undefined ? 0 : game.tokenCost - balance

  return (
    <Card className="gap-4">
      <View className="gap-1">
        <Text accessibilityRole="header" className="text-lg font-semibold text-foreground">
          Cómo se juega
        </Text>
        <Text className="text-base text-muted-foreground">{pack.rules}</Text>
      </View>

      <View className="flex-row gap-3">
        <GameFact label="Costo" value={game.tokenCost === 0 ? "Gratis" : formatTokens(game.tokenCost)} />
        <GameFact label="Premio máximo" value={formatTokens(game.maxTokenReward)} tone="gain" />
      </View>
      <GameFact label="Tus fichas" value={balance === undefined ? "—" : formatTokens(balance)} />

      <Text className="text-sm text-muted-foreground">
        Ganas según tu puntaje, de 0 a 100: con 100 te llevas el premio completo y con 50, la mitad.
        {game.tokenCost > 0 && " El costo se descuenta cuando terminas la partida."}
      </Text>

      {missing > 0 && (
        <Notice>{`Te faltan ${formatTokens(missing)} para jugar. Ganas fichas cumpliendo tus metas de ahorro o con los juegos gratis.`}</Notice>
      )}

      <Button label="Empezar partida" onPress={onStart} disabled={missing > 0 || wallet.isLoading} />
    </Card>
  )
}
