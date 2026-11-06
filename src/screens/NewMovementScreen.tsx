import { toApiError, userMessage } from "@/api/errors"
import { Button } from "@/components/ui/Button"
import { Field } from "@/components/ui/Field"
import { Notice } from "@/components/ui/Notice"
import { SegmentedControl } from "@/components/ui/SegmentedControl"
import { useToast } from "@/hooks/useToast"
import { expenseService } from "@/services/expenseService"
import { incomeService } from "@/services/incomeService"
import { EXPENSE_CATEGORIES } from "@/types/movements"
import { CATEGORY_META } from "@/utils/categories"
import { todayIso } from "@/utils/dates"
import { applyServerFieldErrors } from "@/utils/formErrors"
import {
  expenseFormSchema,
  incomeFormSchema,
  type ExpenseFormOutput,
  type ExpenseFormValues,
  type IncomeFormOutput,
  type IncomeFormValues,
} from "@/utils/movementValidation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Controller, useForm, type UseFormReturn } from "react-hook-form"
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Kind = "EXPENSE" | "INCOME"

const KIND_OPTIONS = [
  { value: "EXPENSE", label: "Gasto" },
  { value: "INCOME", label: "Ingreso" },
] as const

export default function NewMovementScreen() {
  const router = useRouter()
  const [kind, setKind] = useState<Kind>("EXPENSE")

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="gap-6 px-5 pb-10 pt-4" keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between">
            <Text accessibilityRole="header" className="text-2xl font-semibold text-foreground">
              Nuevo movimiento
            </Text>
            <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={8}>
              <Text className="text-base text-muted-foreground">Cerrar</Text>
            </Pressable>
          </View>

          <SegmentedControl options={KIND_OPTIONS} value={kind} onChange={setKind} />

          {kind === "EXPENSE" ? (
            <ExpenseForm onDone={() => router.back()} />
          ) : (
            <IncomeForm onDone={() => router.back()} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function ExpenseForm({ onDone }: { onDone: () => void }) {
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<ExpenseFormValues, unknown, ExpenseFormOutput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { category: "", amount: "", date: todayIso(), description: "" },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: ExpenseFormOutput) => {
    setFormError(null)
    try {
      await expenseService.create(values)
      toast.success("Gasto registrado")
      onDone()
    } catch (err) {
      const error = toApiError(err)
      if (!applyServerFieldErrors(error, form.setError, ["category", "amount", "date", "description"])) {
        setFormError(userMessage(error))
      }
    }
  }

  return (
    <View className="gap-5">
      {formError && <Notice tone="error">{formError}</Notice>}

      <Controller
        control={form.control}
        name="amount"
        render={({ field }) => (
          <Field
            label="Monto (S/)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={errors.amount?.message}
          />
        )}
      />

      <Controller
        control={form.control}
        name="category"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Categoría</Text>
            <View className="flex-row flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((category) => {
                const selected = field.value === category
                return (
                  <Pressable
                    key={category}
                    onPress={() => field.onChange(category)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-full border px-4 py-2 ${selected ? "border-primary bg-primary" : "border-border bg-card"}`}
                  >
                    <Text className={`text-sm font-medium ${selected ? "text-primary-foreground" : "text-foreground"}`}>
                      {CATEGORY_META[category].label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
            {errors.category?.message ? <Text className="text-sm text-destructive">{errors.category.message}</Text> : null}
          </View>
        )}
      />

      <DateAndDescription form={form} />

      <Button label={isSubmitting ? "Guardando…" : "Guardar gasto"} loading={isSubmitting} onPress={form.handleSubmit(onSubmit)} />
    </View>
  )
}

function IncomeForm({ onDone }: { onDone: () => void }) {
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<IncomeFormValues, unknown, IncomeFormOutput>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: { source: "", amount: "", date: todayIso(), description: "" },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: IncomeFormOutput) => {
    setFormError(null)
    try {
      await incomeService.create(values)
      toast.success("Ingreso registrado")
      onDone()
    } catch (err) {
      const error = toApiError(err)
      if (!applyServerFieldErrors(error, form.setError, ["source", "amount", "date", "description"])) {
        setFormError(userMessage(error))
      }
    }
  }

  return (
    <View className="gap-5">
      {formError && <Notice tone="error">{formError}</Notice>}

      <Controller
        control={form.control}
        name="amount"
        render={({ field }) => (
          <Field
            label="Monto (S/)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={errors.amount?.message}
          />
        )}
      />

      <Controller
        control={form.control}
        name="source"
        render={({ field }) => (
          <Field
            label="¿De dónde vino?"
            placeholder="Sueldo, mesada, venta..."
            autoCapitalize="sentences"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={errors.source?.message}
          />
        )}
      />

      <DateAndDescription form={form} />

      <Button label={isSubmitting ? "Guardando…" : "Guardar ingreso"} loading={isSubmitting} onPress={form.handleSubmit(onSubmit)} />
    </View>
  )
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DateAndDescription({ form }: { form: UseFormReturn<any, any, any> }) {
  const errors = form.formState.errors
  return (
    <>
      <Controller
        control={form.control}
        name="date"
        render={({ field }) => (
          <Field
            label="Fecha"
            placeholder="AAAA-MM-DD"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={errors.date?.message as string | undefined}
          />
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field }) => (
          <Field
            label="Descripción (opcional)"
            placeholder="Una nota para recordarlo"
            autoCapitalize="sentences"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={errors.description?.message as string | undefined}
          />
        )}
      />
    </>
  )
}
