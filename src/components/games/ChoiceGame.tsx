import { useState } from "react"
import { Pressable, Text, View } from "react-native"
import { Card } from "@/components/ui/Card"
import type { ChoiceQuestion } from "@/games/types"
import { RoundFeedback } from "./RoundFeedback"
import { RoundHeader } from "./RoundHeader"

interface ChoiceGameProps {
  questions: ChoiceQuestion[]
  /** "Pregunta" en una trivia, "Situación" en el quiz. */
  unit: string
  onFinish: (correct: number) => void
  /** Se llama al pasar a la siguiente pregunta; la pantalla lo usa para volver arriba. */
  onStep?: () => void
}

/** Trivia y quiz: una pregunta a la vez, con la explicación apenas se responde. */
export function ChoiceGame({ questions, unit, onFinish, onStep }: ChoiceGameProps) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)

  const question = questions[index]
  const answered = picked !== null
  const last = index === questions.length - 1

  const pick = (option: number) => {
    if (answered) return
    setPicked(option)
    if (option === question.answer) setCorrect((count) => count + 1)
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
      <RoundHeader unit={unit} index={index} total={questions.length} answered={answered} correct={correct} />
      <Card className="gap-4">
        <Text accessibilityRole="header" className="text-lg font-semibold leading-snug text-foreground">
          {question.prompt}
        </Text>

        <View className="gap-2">
          {question.options.map((option, i) => {
            const isAnswer = i === question.answer
            const isPicked = i === picked
            const surface = !answered
              ? "border-border"
              : isAnswer
                ? "border-gain bg-gain/10"
                : isPicked
                  ? "border-loss bg-loss/10"
                  : "border-border opacity-60"
            return (
              <Pressable
                key={option}
                onPress={() => pick(i)}
                disabled={answered}
                accessibilityRole="button"
                accessibilityState={{ disabled: answered, selected: isPicked }}
                className={`min-h-12 flex-row items-center gap-2 rounded-xl border px-4 py-3 active:opacity-80 ${surface}`}
              >
                <Text className="flex-1 text-base text-foreground">{option}</Text>
                {answered && isAnswer && <Text className="text-xs font-medium text-gain">Correcta</Text>}
                {answered && isPicked && !isAnswer && (
                  <Text className="text-xs font-medium text-loss">Tu respuesta</Text>
                )}
              </Pressable>
            )
          })}
        </View>

        <RoundFeedback
          result={
            answered
              ? {
                  right: picked === question.answer,
                  verdict:
                    picked === question.answer
                      ? "¡Correcto!"
                      : `No era esa. La respuesta es «${question.options[question.answer]}».`,
                  explanation: question.explanation,
                }
              : null
          }
          nextLabel={last ? "Ver resultado" : `Siguiente ${unit.toLowerCase()}`}
          onNext={next}
        />
      </Card>
    </View>
  )
}
