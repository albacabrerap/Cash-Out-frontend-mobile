import { Pressable, Text, View } from "react-native"

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-full bg-muted p-1">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`flex-1 items-center rounded-full py-2 ${selected ? "bg-card" : ""}`}
          >
            <Text className={`text-sm font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
