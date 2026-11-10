import { Text, View } from "react-native"
import { Button } from "@/components/ui/Button"

interface RoundFeedbackProps {
  /** null mientras no se responde. */
  result: { right: boolean; verdict: string; explanation: string } | null
  nextLabel: string
  onNext: () => void
}

/** Lo que pasó con la respuesta y el botón para seguir; no ocupa nada hasta que se responde. */
export function RoundFeedback({ result, nextLabel, onNext }: RoundFeedbackProps) {
  if (!result) return null
  return (
    <View className="gap-3">
      <View
        accessibilityRole="alert"
        className={`gap-1 rounded-lg border p-4 ${result.right ? "border-gain bg-gain/10" : "border-loss bg-loss/10"}`}
      >
        <Text className={`font-medium ${result.right ? "text-gain" : "text-loss"}`}>{result.verdict}</Text>
        <Text className="text-sm text-muted-foreground">{result.explanation}</Text>
      </View>
      <Button label={nextLabel} onPress={onNext} />
    </View>
  )
}
