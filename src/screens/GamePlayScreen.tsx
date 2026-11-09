import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, BackHandler, Platform, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ApiError, toApiError } from "@/api/errors"
import { ChoiceGame } from "@/components/games/ChoiceGame"
import { GameIntro } from "@/components/games/GameIntro"
import { GameResult, type SaveState } from "@/components/games/GameResult"
import { GameThumb } from "@/components/games/GameThumb"
import { LoanGame } from "@/components/games/LoanGame"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { Skeleton } from "@/components/ui/Skeleton"
import { useApiQuery } from "@/hooks/useApiQuery"
import { minigameService } from "@/services/minigameService"
import { walletService } from "@/services/walletService"
import type { Minigame } from "@/types/minigames"
import {
  MINIGAME_TYPE_LABEL,
  packFor,
  prepareRun,
  runLength,
  scoreFor,
  type GameRun,
} from "@/utils/minigames"

type Phase =
  | { name: "intro" }
  | { name: "playing"; run: GameRun }
  | { name: "done"; correct: number; total: number; score: number }

function parseId(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export default function GamePlayScreen() {
  const router = useRouter()
  const id = parseId(useLocalSearchParams<{ id: string }>().id)
  const notFound = () => Promise.reject(new ApiError({ kind: "http", status: 404 }))
  const game = useApiQuery(["minigame", id], (signal) => (id ? minigameService.get(id, signal) : notFound()))
  const wallet = useApiQuery(["wallet"], (signal) => walletService.get(signal))
  const [phase, setPhase] = useState<Phase>({ name: "intro" })
  const [save, setSave] = useState<SaveState>({ status: "saving" })
  const scroll = useRef<ScrollView>(null)

  const playing = phase.name === "playing"

  const exit = useCallback(() => {
    if (router.canGoBack()) router.back()
    else router.replace("/games")
  }, [router])

  // La partida se registra recién al terminar: salir a la mitad no cobra, pero se pierde lo jugado.
  const askToLeave = useCallback(() => {
    // En web `Alert.alert` no hace nada, así que se usa la confirmación del navegador.
    if (Platform.OS === "web") {
      if (window.confirm("¿Salir de la partida? Si sales ahora, la partida no se registra y no ganas fichas.")) exit()
      return
    }
    Alert.alert(
      "¿Salir de la partida?",
      "Si sales ahora, la partida no se registra: no se cobra nada, pero tampoco ganas fichas.",
      [
        { text: "Seguir jugando", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: exit },
      ],
    )
  }, [exit])

  // Atrás de Android: durante la partida pide confirmación en vez de salir.
  useEffect(() => {
    if (!playing) return
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      askToLeave()
      return true
    })
    return () => subscription.remove()
  }, [playing, askToLeave])

  const back = (
    <Pressable
      onPress={playing ? askToLeave : exit}
      accessibilityRole="button"
      accessibilityLabel="Volver a minijuegos"
      hitSlop={8}
      className="self-start py-1 active:opacity-70"
    >
      <Text className="text-sm font-medium text-accent-ink">‹ Volver a minijuegos</Text>
    </Pressable>
  )

  if (game.error?.status === 404) {
    return (
      <Shell back={back} playing={playing}>
        <EmptyState
          title="No encontramos este juego"
          description="Puede que ya no esté publicado o que el enlace no sea correcto."
          actionLabel="Volver a minijuegos"
          onAction={exit}
        />
      </Shell>
    )
  }
  if (game.error && !game.data) {
    return (
      <Shell back={back} playing={playing}>
        <ErrorState error={game.error} onRetry={game.reload} />
      </Shell>
    )
  }
  if (!game.data) {
    return (
      <Shell back={back} playing={playing}>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </Shell>
    )
  }

  const data = game.data
  const pack = packFor(data)
  if (!pack) {
    return (
      <Shell back={back} playing={playing}>
        <EmptyState
          title="Este juego todavía no se puede jugar en la app"
          description="Ya está en el catálogo, pero su contenido aún no llega a esta versión."
          actionLabel="Volver a minijuegos"
          onAction={exit}
        />
      </Shell>
    )
  }

  const register = async (target: Minigame, score: number) => {
    setSave({ status: "saving" })
    try {
      const session = await minigameService.play({ minigameId: target.id, score })
      setSave({ status: "saved", session })
      wallet.reload()
    } catch (err) {
      setSave({ status: "error", error: toApiError(err) })
    }
  }

  const finish = (run: GameRun, correct: number) => {
    const total = runLength(run)
    const score = scoreFor(correct, total)
    setPhase({ name: "done", correct, total, score })
    scroll.current?.scrollTo({ y: 0, animated: false })
    void register(data, score)
  }

  const toTop = () => scroll.current?.scrollTo({ y: 0, animated: true })

  return (
    <Shell back={back} playing={playing} scrollRef={scroll}>
      <View className="flex-row items-start gap-4">
        <GameThumb id={data.id} title={data.title} />
        <View className="flex-1 gap-1">
          <Text accessibilityRole="header" className="text-2xl font-semibold leading-tight text-foreground">
            {data.title}
          </Text>
          <Text className="text-sm text-muted-foreground">{pack.description}</Text>
          <Text className="self-start rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {MINIGAME_TYPE_LABEL[data.type]}
          </Text>
        </View>
      </View>

      {phase.name === "intro" && (
        <GameIntro
          game={data}
          pack={pack}
          wallet={wallet}
          onStart={() => setPhase({ name: "playing", run: prepareRun(pack) })}
        />
      )}

      {phase.name === "playing" &&
        (phase.run.type === "SIMULATION" ? (
          <LoanGame rounds={phase.run.rounds} onStep={toTop} onFinish={(correct) => finish(phase.run, correct)} />
        ) : (
          <ChoiceGame
            questions={phase.run.questions}
            unit={phase.run.type === "QUIZ" ? "Situación" : "Pregunta"}
            onStep={toTop}
            onFinish={(correct) => finish(phase.run, correct)}
          />
        ))}

      {phase.name === "done" && (
        <GameResult
          correct={phase.correct}
          total={phase.total}
          score={phase.score}
          save={save}
          balance={wallet.isRefreshing ? undefined : wallet.data?.tokenBalance}
          onRetry={() => void register(data, phase.score)}
          onPlayAgain={() => {
            setPhase({ name: "intro" })
            scroll.current?.scrollTo({ y: 0, animated: false })
          }}
          onExit={exit}
        />
      )}
    </Shell>
  )
}

function Shell({
  back,
  playing,
  scrollRef,
  children,
}: {
  back: React.ReactNode
  playing: boolean
  scrollRef?: React.Ref<ScrollView>
  children: React.ReactNode
}) {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Durante la partida el gesto de volver se apaga: salir pasa por la confirmación. */}
      <Stack.Screen options={{ gestureEnabled: !playing }} />
      <ScrollView ref={scrollRef} contentContainerClassName="gap-4 px-5 pb-10 pt-3" keyboardShouldPersistTaps="handled">
        {back}
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}
