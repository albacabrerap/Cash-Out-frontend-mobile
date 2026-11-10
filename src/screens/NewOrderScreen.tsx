import { toApiError, userMessage } from "@/api/errors"
import { pnlTextClass } from "@/components/portfolio/pnl"
import { Button } from "@/components/ui/Button"
import { Field } from "@/components/ui/Field"
import { Notice } from "@/components/ui/Notice"
import { SegmentedControl } from "@/components/ui/SegmentedControl"
import { Skeleton } from "@/components/ui/Skeleton"
import { useApiQuery } from "@/hooks/useApiQuery"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useToast } from "@/hooks/useToast"
import { assetService, orderService, portfolioService, walletService } from "@/services/portfolioService"
import type { Asset, OrderSide, TradeOrder } from "@/types/portfolio"
import { formatPercent, formatQuantity, formatTokenAmount, formatTokens } from "@/utils/format"
import { newUuid } from "@/utils/uuid"
import { useThemeColors } from "@/utils/theme"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useRef, useState } from "react"
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const SIDE_OPTIONS = [
  { value: "BUY", label: "Comprar" },
  { value: "SELL", label: "Vender" },
] as const

interface PickedAsset {
  id: number
  symbol: string
  name: string
}

/** Acepta "1,5" y "1.5": el teclado decimal en es-PE pone coma. */
function parseQuantity(text: string): number | null {
  const value = Number(text.trim().replace(",", "."))
  return text.trim() !== "" && Number.isFinite(value) && value > 0 ? value : null
}

export default function NewOrderScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ assetId?: string; symbol?: string; name?: string }>()
  const preset: PickedAsset | null =
    params.assetId && params.symbol
      ? { id: Number(params.assetId), symbol: params.symbol, name: params.name ?? params.symbol }
      : null

  const [side, setSide] = useState<OrderSide>("BUY")
  const [asset, setAsset] = useState<PickedAsset | null>(preset)
  const [result, setResult] = useState<TradeOrder | null>(null)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="gap-6 px-5 pb-10 pt-4" keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between">
            <Text accessibilityRole="header" className="text-2xl font-semibold text-foreground">
              {result ? "Resultado" : "Nueva orden"}
            </Text>
            <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={8}>
              <Text className="text-base text-muted-foreground">Cerrar</Text>
            </Pressable>
          </View>

          {result ? (
            <OrderResult order={result} onDone={() => router.back()} />
          ) : (
            <>
              <SegmentedControl options={SIDE_OPTIONS} value={side} onChange={setSide} />
              {asset ? (
                <OrderForm
                  key={asset.id}
                  asset={asset}
                  side={side}
                  onChangeAsset={preset ? undefined : () => setAsset(null)}
                  onPlaced={setResult}
                />
              ) : (
                <AssetPicker onPick={(picked) => setAsset({ id: picked.id, symbol: picked.symbol, name: picked.name })} />
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function AssetPicker({ onPick }: { onPick: (asset: Asset) => void }) {
  const [search, setSearch] = useState("")
  const term = useDebouncedValue(search, 300)
  const results = useApiQuery(["assets", term], (signal) => assetService.search(term, signal))

  return (
    <View className="gap-3">
      <Field
        label="¿Qué quieres operar?"
        placeholder="Ej.: AAPL o Bitcoin"
        value={search}
        onChangeText={setSearch}
        autoFocus
        returnKeyType="search"
      />

      {results.error && results.data === undefined ? (
        <Notice tone="error">{userMessage(results.error)}</Notice>
      ) : results.data === undefined ? (
        <View className="gap-3 py-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </View>
      ) : results.data.content.length === 0 ? (
        <Text className="py-4 text-center text-sm text-muted-foreground">No encontramos activos con “{term}”.</Text>
      ) : (
        <View className="rounded-2xl border border-border bg-card px-4">
          {results.data.content.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => onPick(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.symbol}, ${item.name}`}
              className={`flex-row items-center gap-3 py-3 active:opacity-70 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">{item.symbol}</Text>
                <Text numberOfLines={1} className="text-sm text-muted-foreground">
                  {item.name}
                </Text>
              </View>
              <Text className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {item.type}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}

interface OrderFormProps {
  asset: PickedAsset
  side: OrderSide
  onChangeAsset?: () => void
  onPlaced: (order: TradeOrder) => void
}

function OrderForm({ asset, side, onChangeAsset, onPlaced }: OrderFormProps) {
  const toast = useToast()
  const quote = useApiQuery(["quote", asset.id], (signal) => assetService.quote(asset.id, signal))
  const wallet = useApiQuery(["token-wallet"], (signal) => walletService.get(signal))
  const portfolio = useApiQuery(["portfolio"], (signal) => portfolioService.get(signal))

  const [quantityText, setQuantityText] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  // El mismo id solo cuando se reintenta exactamente la misma orden: si la
  // respuesta se pierde y el usuario vuelve a tocar, el backend devuelve la orden
  // ya ejecutada en vez de comprar otra vez. Si cambio el lado o la cantidad es
  // otra orden y lleva id nuevo; reusar el anterior devolveria la orden vieja.
  const pending = useRef<{ id: string; signature: string } | null>(null)

  const quantity = parseQuantity(quantityText)
  const price = quote.data?.price
  const estimate = price != null && quantity != null ? price * quantity : null
  const balance = wallet.data?.tokenBalance
  const held = portfolio.data?.positions.find((position) => position.assetId === asset.id)?.quantity ?? 0

  let problem: string | null = null
  if (quantityText.trim() !== "" && quantity == null) problem = "Ingresa una cantidad mayor que cero."
  else if (side === "BUY" && estimate != null && balance != null && estimate > balance)
    problem = `No te alcanzan las fichas: tienes ${formatTokens(balance)}.`
  else if (side === "SELL" && quantity != null && portfolio.data && quantity > held)
    problem = held > 0 ? `Solo tienes ${formatQuantity(held)} unidades.` : "No tienes este activo en tu cartera."

  const fillMax = () => {
    if (side === "SELL") {
      if (held > 0) setQuantityText(String(held))
    } else if (price && balance != null) {
      const max = Math.floor((balance / price) * 10_000) / 10_000
      if (max > 0) setQuantityText(String(max))
    }
  }

  const submit = useAsyncAction(async () => {
    if (quantity == null || problem) return
    setFormError(null)
    try {
      const signature = `${asset.id}:${side}:${quantity}`
      if (pending.current?.signature !== signature) pending.current = { id: newUuid(), signature }
      const order = await orderService.place({ clientOrderId: pending.current.id, assetId: asset.id, side, quantity })
      pending.current = null
      if (order.status === "EXECUTED") toast.success(side === "BUY" ? "Compra realizada" : "Venta realizada")
      onPlaced(order)
    } catch (err) {
      setFormError(userMessage(toApiError(err)))
    }
  })

  return (
    <View className="gap-5">
      {formError && <Notice tone="error">{formError}</Notice>}

      <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">{asset.symbol}</Text>
          <Text numberOfLines={1} className="text-sm text-muted-foreground">
            {asset.name}
          </Text>
        </View>
        <View className="items-end">
          {quote.data ? (
            <>
              <Text className="text-base font-semibold text-foreground">{formatTokenAmount(quote.data.price)}</Text>
              <Text className={`text-sm ${pnlTextClass(quote.data.changePercent)}`}>
                {formatPercent(quote.data.changePercent)} hoy
              </Text>
            </>
          ) : quote.error ? (
            <Pressable onPress={quote.reload} accessibilityRole="button">
              <Text className="text-sm text-destructive">Sin precio · Reintentar</Text>
            </Pressable>
          ) : (
            <Skeleton className="h-9 w-20" />
          )}
        </View>
      </View>
      {onChangeAsset && (
        <Pressable onPress={onChangeAsset} accessibilityRole="button" hitSlop={8} className="-mt-3 self-start">
          <Text className="text-sm font-medium text-accent-ink">Cambiar activo</Text>
        </Pressable>
      )}

      <View className="gap-1.5">
        <View className="flex-row items-end gap-2">
          <View className="flex-1">
            <Field
              label="Cantidad"
              placeholder="0"
              keyboardType="decimal-pad"
              value={quantityText}
              onChangeText={setQuantityText}
              autoFocus
            />
          </View>
          <Pressable
            onPress={fillMax}
            disabled={!quote.data}
            accessibilityRole="button"
            accessibilityLabel={side === "BUY" ? "Usar el máximo que alcanza" : "Vender todo"}
            className={`h-[50px] items-center justify-center rounded-xl border border-border bg-card px-4 ${quote.data ? "" : "opacity-50"}`}
          >
            <Text className="text-sm font-medium text-foreground">Máx.</Text>
          </Pressable>
        </View>
        <Text className="text-sm text-muted-foreground">
          {side === "BUY"
            ? `Disponible: ${balance != null ? formatTokens(balance) : "—"}`
            : `Tienes ${formatQuantity(held)} unidades`}
        </Text>
      </View>

      <View className="flex-row items-center justify-between rounded-2xl bg-muted px-4 py-3">
        <Text className="text-sm text-muted-foreground">{side === "BUY" ? "Costo estimado" : "Recibirías aprox."}</Text>
        <Text className="text-base font-semibold text-foreground">{estimate != null ? formatTokens(estimate) : "—"}</Text>
      </View>

      {problem && <Text className="text-sm text-destructive">{problem}</Text>}

      <View className="gap-2">
        <Button
          label={submit.isPending ? "Enviando…" : side === "BUY" ? "Confirmar compra" : "Confirmar venta"}
          loading={submit.isPending}
          disabled={quantity == null || !!problem || !quote.data}
          onPress={() => void submit.run()}
        />
        <Text className="text-center text-xs text-muted-foreground">
          El precio final se fija al momento de ejecutar la orden.
        </Text>
      </View>
    </View>
  )
}

function OrderResult({ order, onDone }: { order: TradeOrder; onDone: () => void }) {
  const colors = useThemeColors()
  const executed = order.status === "EXECUTED"
  const color = executed ? colors.income : colors.destructive

  return (
    <View className="items-center gap-3 py-6">
      <View
        style={{ backgroundColor: `${color}26` }}
        className="h-16 w-16 items-center justify-center rounded-full"
      >
        <Ionicons name={executed ? "checkmark" : "alert"} size={32} color={color} />
      </View>
      <Text accessibilityRole="header" className="text-center text-xl font-semibold text-foreground">
        {executed
          ? `${order.side === "BUY" ? "Compraste" : "Vendiste"} ${formatQuantity(order.quantity)} ${order.symbol}`
          : "La orden fue rechazada"}
      </Text>
      <Text className="text-center text-base text-muted-foreground">
        {executed
          ? `A ${formatTokenAmount(order.executionPrice)} por unidad · ${formatTokens(order.tokensMoved)}`
          : (order.rejectionReason ?? "El simulador no pudo ejecutarla.")}
      </Text>
      <View className="mt-3 w-full">
        <Button label="Listo" onPress={onDone} />
      </View>
    </View>
  )
}
