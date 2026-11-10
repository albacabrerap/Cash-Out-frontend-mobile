import { Text, View } from "react-native"

interface RoundHeaderProps {
  /** "Pregunta", "Situación", "Ronda". */
  unit: string
  index: number
  total: number
  answered: boolean
  correct: number
}

export function RoundHeader({ unit, index, total, answered, correct }: RoundHeaderProps) {
  const done = index + (answered ? 1 : 0)
  return (
    <View className="gap-2">
      <View className="flex-row justify-between gap-3">
        <Text className="text-sm text-muted-foreground">
          {unit} {index + 1} de {total}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {correct} {correct === 1 ? "acierto" : "aciertos"}
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Avance de la partida"
        accessibilityValue={{ min: 0, max: total, now: done, text: `${done} de ${total}` }}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <View className="h-full rounded-full bg-primary" style={{ width: `${(done / total) * 100}%` }} />
      </View>
    </View>
  )
}
