import { toApiError, userMessage } from "@/api/errors"
import { Button } from "@/components/ui/Button"
import { Field } from "@/components/ui/Field"
import { Notice } from "@/components/ui/Notice"
import { useAuth } from "@/hooks/useAuth"
import { applyServerFieldErrors } from "@/utils/formErrors"
import { registerFormSchema, type RegisterFormValues } from "@/utils/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from "expo-router"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const FIELDS = ["name", "email", "password", "birthDate"] as const

export default function RegisterScreen() {
  const { register: registerAccount } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: "", email: "", password: "", birthDate: "", accepted: false },
  })
  const { errors, isSubmitting } = form.formState
  const password = useWatch({ control: form.control, name: "password" })

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null)
    try {
      const result: any = await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password,
        birthDate: values.birthDate || undefined,
      })
      
      if (result.verificationRequired) setPendingEmail(result.user.email)
    } catch (err) {
      const error = toApiError(err)
      if (error.status === 409) {
        form.setError("email", { type: "server", message: userMessage(error) })
        form.setFocus("email")
      } else if (!applyServerFieldErrors(error, form.setError, FIELDS)) {
        setFormError(userMessage(error))
      }
    }
  }

  if (pendingEmail) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-grow justify-center gap-5 px-6 py-8">
          <Text className="text-2xl font-semibold text-foreground">Tu cuenta ha sido creada</Text>
          <Text className="text-base text-muted-foreground">
            Un enlace de confirmación fue enviado al correo {pendingEmail}. Procure activar tu cuenta.
          </Text>
          <Button label="Correo ya confirmado." onPress={() => router.replace("/login")} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center gap-7 px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-2">
            <Text className="text-4xl font-semibold text-foreground">Crea tu cuenta</Text>
            <Text className="text-base text-muted-foreground">
              Registra tus ingresos, gastos y ahorros, aprende a invertir sin arriesgar tu propio dinero.
            </Text>
          </View>

          {formError && <Notice tone="error">{formError}</Notice>}

          <View className="gap-5">
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Field
                  label="Nombre completo"
                  placeholder="Su nombre"
                  autoComplete="name"
                  returnKeyType="next"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  onSubmitEditing={() => form.setFocus("email")}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field }) => (
                <Field
                  label="Correo"
                  placeholder="ejemplo@correo.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  onSubmitEditing={() => form.setFocus("password")}
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field }) => (
                <Field
                  label="Contraseña"
                  placeholder="Cree una contraseña"
                  secureToggle
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="next"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  onSubmitEditing={() => form.setFocus("birthDate")}
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <Field
                  label="Fecha de nacimiento (opcional)"
                  placeholder="AAAA-MM-DD"
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="next"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  onSubmitEditing={() => form.setFocus("accepted")}
                  error={errors.birthDate?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="accepted"
              render={({ field }) => (
                <View className="gap-1.5">
                  <Text
                    onPress={() => field.onChange(!field.value)}
                    className="text-sm text-muted-foreground"
                  >
                    Recuerde que Cash-Out utiliza un sistema de fichas que no compromete su dinero real.
                  </Text>
                  {errors.accepted?.message && (
                    <Text className="text-sm text-destructive">{errors.accepted.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          <Button
            label={isSubmitting ? "En corto se creará su cuenta..." : "Crear cuenta"}
            loading={isSubmitting}
            onPress={form.handleSubmit(onSubmit)}
          />
           <Text className="text-center text-sm text-muted-foreground">
                ¿Ya tiene cuenta?{" "}
            <Text
              className="font-medium text-foreground underline"
              onPress={() => router.push("/login")}
            >
              Iniciar sesión
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}