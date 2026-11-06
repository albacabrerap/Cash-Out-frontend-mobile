import { Text, View } from "react-native"
import { Button } from "./Button"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-2 px-6 py-12">
      <Text className="text-center text-lg font-semibold text-foreground">{title}</Text>
      <Text className="text-center text-base text-muted-foreground">{description}</Text>
      {actionLabel && onAction && (
        <View className="mt-3 w-full">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  )
}
