import { Text, View } from "react-native"
import { gameInitials } from "@/utils/minigames"

const TONES = [
  { surface: "bg-primary", ink: "text-primary-foreground" },
  { surface: "bg-secondary", ink: "text-secondary-foreground" },
  { surface: "bg-accent", ink: "text-accent-foreground" },
]

/** Las iniciales del juego; el color sale del id para que sea el mismo en todas las pantallas. */
export function GameThumb({ id, title, size = "md" }: { id: number; title: string; size?: "sm" | "md" }) {
  const tone = TONES[id % TONES.length]
  const box = size === "sm" ? "size-10" : "size-12"
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`${box} items-center justify-center rounded-xl ${tone.surface}`}
    >
      <Text className={`text-base font-bold ${tone.ink}`}>{gameInitials(title)}</Text>
    </View>
  )
}
