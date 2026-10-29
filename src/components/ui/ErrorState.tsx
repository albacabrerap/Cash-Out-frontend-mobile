import { userMessage, type ApiError } from "@/api/errors";
import { Text, View } from "react-native";
import { Button } from "./Button";

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  return (
    <View accessibilityRole="alert" className="items-center gap-2 px-6 py-10">
      <Text className="text-center text-lg font-semibold text-foreground">No pudimos cargar esto</Text>
      <Text className="text-center text-base text-muted-foreground">{userMessage(error)}</Text>
      <View className="mt-3 w-full">
        <Button label="Reintentar" variant="outline" onPress={onRetry} />
      </View>
    </View>
  )
}
