import { useState } from "react"
import { Text, View } from "react-native"
import { Button } from "@/components/ui/Button"
import type { LoanRound } from "@/games/types"
import { formatSoles } from "@/utils/format"
import { installment, loanTotal, type LoanOffer } from "@/utils/loans"
import { RoundFeedback } from "./RoundFeedback"
import { RoundHeader } from "./RoundHeader"

const percent = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 })
const LETTERS = "ABCDEFGH"

function extrasText(offer: LoanOffer): string {
  const parts = [
    offer.fee > 0 && `comisión de ${formatSoles(offer.fee)}`,
    offer.monthlyInsurance > 0 && `seguro de ${formatSoles(offer.monthlyInsurance)} al mes`,
  ].filter(Boolean)
  return parts.length === 0 ? "Sin costos extra" : parts.join(" y ").replace(/^./, (c) => c.toUpperCase())
}

interface LoanGameProps {
  rounds: LoanRound[]
  onFinish: (correct: number) => void
  /** Se llama al pasar a la siguiente ronda; la pantalla lo usa para volver arriba. */
  onStep?: () => void
}

/** Cada ronda: ofertas para la misma necesidad; acierta quien elige la que cuesta menos en total. */
export function LoanGame({ rounds, onFinish, onStep }: LoanGameProps) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)

  const round = rounds[index]
  const totals = round.offers.map((offer) => loanTotal(round.principal, offer))
  const cheapest = totals.indexOf(Math.min(...totals))
  const answered = picked !== null
  const last = index === rounds.length - 1

  const pick = (offer: number) => {
    setPicked(offer)
    if (offer === cheapest) setCorrect((count) => count + 1)
  }

  const next = () => {
    if (last) {
      onFinish(correct)
      return
    }
    setIndex(index + 1)
    setPicked(null)
    onStep?.()
  }

  return (
    <View className="gap-4">
      <RoundHeader unit="Ronda" index={index} total={rounds.length} answered={answered} correct={correct} />
      <Text accessibilityRole="header" className="text-lg font-semibold leading-snug text-foreground">
        Necesitas {formatSoles(round.principal)} para {round.need}. ¿Qué préstamo te cuesta menos?
      </Text>

      <View className="gap-3">
        {round.offers.map((offer, i) => {
          const letter = LETTERS[i]
          const total = totals[i]
          const surface =
            answered && i === cheapest
              ? "border-gain bg-gain/5"
              : answered && i === picked
                ? "border-loss bg-loss/5"
                : "border-border bg-card"
          return (
            <View key={offer.lender} className={`gap-3 rounded-xl border p-4 ${surface}`}>
              <View>
                <Text className="text-xs font-medium uppercase text-muted-foreground">Oferta {letter}</Text>
                <Text className="text-base font-medium text-foreground">{offer.lender}</Text>
              </View>

              <View className="gap-1">
                <Row label="TEA" value={`${percent.format(offer.tea * 100)} %`} />
                <Row label="Plazo" value={`${offer.months} meses`} />
                <Row
                  label="Cuota"
                  value={formatSoles(installment(round.principal, offer.tea, offer.months))}
                  strong
                />
              </View>
              <Text className="text-sm text-muted-foreground">{extrasText(offer)}</Text>

              {answered ? (
                <View className="gap-1 border-t border-border pt-3">
                  <Text className="text-xs text-muted-foreground">Total a pagar</Text>
                  <Text className="text-lg font-semibold text-foreground">{formatSoles(total)}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {formatSoles(total - round.principal)} en intereses y costos
                  </Text>
                  {(i === cheapest || i === picked) && (
                    <View className="flex-row flex-wrap gap-1.5 pt-1">
                      {i === cheapest && (
                        <Text className="rounded-full border border-gain px-2 py-0.5 text-xs text-gain">
                          La más barata
                        </Text>
                      )}
                      {i === picked && (
                        <Text className="rounded-full border border-border px-2 py-0.5 text-xs text-foreground">
                          Tu elección
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <Button label={`Elegir la oferta ${letter}`} variant="outline" onPress={() => pick(i)} />
              )}
            </View>
          )
        })}
      </View>

      <RoundFeedback
        result={
          answered
            ? {
                right: picked === cheapest,
                verdict:
                  picked === cheapest
                    ? "¡Bien elegido! Es la que menos te cuesta."
                    : `La más barata era la oferta ${LETTERS[cheapest]}: te ahorraba ${formatSoles(totals[picked] - totals[cheapest])}.`,
                explanation: round.explanation,
              }
            : null
        }
        nextLabel={last ? "Ver resultado" : "Siguiente ronda"}
        onNext={next}
      />
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
