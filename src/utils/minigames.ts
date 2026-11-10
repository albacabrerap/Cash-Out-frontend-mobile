import { betOrInvest } from "@/games/betOrInvest"
import { compoundInterest } from "@/games/compoundInterest"
import { loanSimulator } from "@/games/loanSimulator"
import type { ChoiceQuestion, GamePack, LoanRound } from "@/games/types"
import type { Minigame, MinigameSession, MinigameType } from "@/types/minigames"

export const MINIGAME_TYPE_LABEL: Record<MinigameType, string> = {
  TRIVIA: "Trivia",
  QUIZ: "Quiz",
  SIMULATION: "Simulación",
}

/** Las preguntas viven en el cliente: el `topic` del catálogo dice cuál de estos contenidos se juega. */
export const GAME_CONTENTS: { topic: string; pack: GamePack }[] = [
  { topic: "Interés compuesto", pack: compoundInterest },
  { topic: "Apuesta o inversión", pack: betOrInvest },
  { topic: "Préstamos", pack: loanSimulator },
]

/** "Apuesta o inversión" → "apuesta-o-inversion". */
export function topicKey(topic: string): string {
  return topic
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const PACKS: Record<string, GamePack> = Object.fromEntries(
  GAME_CONTENTS.map(({ topic, pack }) => [topicKey(topic), pack]),
)

/** null si la app no tiene contenido para ese tema o el tipo no coincide. */
export function packFor(game: Pick<Minigame, "type" | "topic">): GamePack | null {
  const pack = game.topic ? PACKS[topicKey(game.topic)] : undefined
  return pack && pack.type === game.type ? pack : null
}

/** Cuántas preguntas o rondas tiene un juego, para mostrarlo en la tarjeta. */
export function packLength(pack: GamePack): string {
  return pack.type === "SIMULATION" ? `${pack.rounds.length} rondas` : `${pack.questions.length} preguntas`
}

/** El backend paga en proporción a un puntaje de 0 a 100. */
export function scoreFor(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}

export type GameRun =
  | { type: "TRIVIA" | "QUIZ"; questions: ChoiceQuestion[] }
  | { type: "SIMULATION"; rounds: LoanRound[] }

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function shuffleOptions(question: ChoiceQuestion, random: () => number): ChoiceQuestion {
  const order = shuffle(
    question.options.map((_, index) => index),
    random,
  )
  return { ...question, options: order.map((index) => question.options[index]), answer: order.indexOf(question.answer) }
}

/** Cada partida mezcla el orden, para que repetir no sea memorizar posiciones. */
export function prepareRun(pack: GamePack, random = Math.random): GameRun {
  if (pack.type === "SIMULATION") {
    return {
      type: pack.type,
      rounds: pack.rounds.map((round) => ({ ...round, offers: shuffle(round.offers, random) })),
    }
  }
  const questions = shuffle(pack.questions, random)
  return {
    type: pack.type,
    questions: pack.shuffleOptions ? questions.map((question) => shuffleOptions(question, random)) : questions,
  }
}

export function runLength(run: GameRun): number {
  return run.type === "SIMULATION" ? run.rounds.length : run.questions.length
}

/** "¿Apuesta o inversión?" → "AI": las palabras cortas no cuentan. */
export function gameInitials(title: string): string {
  const words = title
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
  const long = words.filter((word) => word.length > 2)
  const picked = (long.length > 0 ? long : words).slice(0, 2)
  return picked
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

/** Cuántas veces se jugó cada juego y su mejor puntaje; las partidas solo traen el título. */
export function gameStats(sessions: MinigameSession[]): Map<string, { plays: number; best: number }> {
  const stats = new Map<string, { plays: number; best: number }>()
  for (const session of sessions) {
    const current = stats.get(session.minigameTitle) ?? { plays: 0, best: 0 }
    stats.set(session.minigameTitle, { plays: current.plays + 1, best: Math.max(current.best, session.score) })
  }
  return stats
}

/** Los gratis primero: son la puerta de entrada para quien todavía no tiene fichas. */
export function sortByCost(games: Minigame[]): Minigame[] {
  return [...games].sort((a, b) => a.tokenCost - b.tokenCost || a.title.localeCompare(b.title, "es"))
}

/** El juego más jugado, solo si de verdad hay uno por encima del resto: con empate no hay favorito. */
export function mostPlayedTitle(stats: Map<string, { plays: number; best: number }>): string | undefined {
  const [first, second] = [...stats].sort((a, b) => b[1].plays - a[1].plays)
  return first && (!second || first[1].plays > second[1].plays) ? first[0] : undefined
}

const signedTokens = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 12.5 → "+12.50 fichas"; -3 → "−3.00 fichas". */
export function formatSignedTokens(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  return `${sign}${signedTokens.format(Math.abs(value))} fichas`
}
