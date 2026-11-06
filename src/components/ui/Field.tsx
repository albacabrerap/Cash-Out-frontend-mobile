import { useState, type Ref } from "react"
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native"

interface FieldProps extends TextInputProps {
  label: string
  error?: string
  secureToggle?: boolean
  inputRef?: Ref<TextInput>
}

export function Field({ label, error, secureToggle = false, inputRef, secureTextEntry, ...input }: FieldProps) {
  const [hidden, setHidden] = useState(true)

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <View
        className={`flex-row items-center rounded-xl border bg-card ${error ? "border-destructive" : "border-input"}`}
      >
        <TextInput
          ref={inputRef}
          className="flex-1 px-4 py-3 text-base text-foreground"
          placeholderTextColor="#9d9ea5"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          accessibilityLabel={label}
          {...input}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar contraseña" : "Ocultar contraseña"}
            className="px-4 py-3"
          >
            <Text className="text-sm text-muted-foreground">{hidden ? "Mostrar" : "Ocultar"}</Text>
          </Pressable>
        )}
      </View>
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  )
}
