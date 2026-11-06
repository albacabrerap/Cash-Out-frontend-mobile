import type { ReactNode } from "react"
import { Pressable, Text, View } from "react-native"

interface SectionProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  children: ReactNode
}

export function Section({ title, actionLabel, onAction, children }: SectionProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text accessibilityRole="header" className="text-xl font-semibold text-foreground">
          {title}
        </Text>
        {actionLabel && onAction && (
          <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
            <Text className="text-sm font-medium text-accent-ink">{actionLabel}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  )
}
