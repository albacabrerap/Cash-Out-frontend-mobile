import { Text, View } from "react-native"

const TONE = { gain: "text-gain", loss: "text-loss" } as const

export function GameFact({ label, value, tone }: { label: string; value: string; tone?: keyof typeof TONE }) {
  return (
    <View className="flex-1 rounded-lg bg-muted px-3 py-2">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className={`text-base font-semibold ${tone ? TONE[tone] : "text-foreground"}`}>{value}</Text>
    </View>
  )
}
