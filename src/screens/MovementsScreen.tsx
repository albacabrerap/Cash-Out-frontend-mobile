import { useState } from "react"
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { toApiError, userMessage } from "@/api/errors"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { MovementRow, MovementRowSkeleton } from "@/components/finance/MovementRow"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useErrorToast } from "@/hooks/useErrorToast"
import { usePaginatedList } from "@/hooks/usePaginatedList"
import { useReloadOnFocus } from "@/hooks/useReloadOnFocus"
import { useToast } from "@/hooks/useToast"
import { expenseService } from "@/services/expenseService"
import { incomeService } from "@/services/incomeService"
import { movementService } from "@/services/movementService"
import type { Movement } from "@/types/movements"
import { formatSoles } from "@/utils/format"
import { incomeDeleteErrorMessage } from "@/utils/movementErrors"
import { movementKey } from "@/utils/movements"
import { useThemeColors } from "@/utils/theme"

const PAGE_SIZE = 15

function Separator() {
  return <View className="h-px bg-border" />
}

export default function MovementsScreen() {
  const router = useRouter()
  const toast = useToast()
  const colors = useThemeColors()
  const [search, setSearch] = useState("")
  const term = useDebouncedValue(search.trim(), 400)

  const list = usePaginatedList(
    (page, signal) =>
      movementService.list({ page, size: PAGE_SIZE, sort: "date,desc", search: term || undefined }, signal),
    [term],
  )

  useReloadOnFocus(list.reload)
  useErrorToast(list.items.length > 0 ? list.error : undefined)

  const remove = async (movement: Movement) => {
    try {
      if (movement.kind === "INCOME") await incomeService.remove(movement.id)
      else await expenseService.remove(movement.id)
      toast.success("Movimiento eliminado")
      list.reload()
    } catch (err) {
      toast.error(movement.kind === "INCOME" ? incomeDeleteErrorMessage(err) : userMessage(toApiError(err)))
    }
  }

  const confirmRemove = (movement: Movement) => {
    const name = movement.label ?? (movement.kind === "INCOME" ? "este ingreso" : "este gasto")
    Alert.alert("Eliminar movimiento", `¿Eliminar "${name}" por ${formatSoles(movement.amount)}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => void remove(movement) },
    ])
  }

  const header = (
    <View className="gap-4 pb-3 pt-4">
      <Text accessibilityRole="header" className="text-3xl font-semibold text-foreground">
        Movimientos
      </Text>
      <View className="flex-row items-center gap-2 rounded-xl border border-input bg-card px-3">
        <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o categoría"
          placeholderTextColor="#9d9ea5"
          accessibilityLabel="Buscar movimientos"
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 py-3 text-base text-foreground"
        />
      </View>
      <Text className="text-xs text-muted-foreground">Mantén presionado un movimiento para eliminarlo.</Text>
    </View>
  )

  let empty = null
  if (list.isLoading) {
    empty = (
      <View>
        {Array.from({ length: 6 }, (_, index) => (
          <MovementRowSkeleton key={index} />
        ))}
      </View>
    )
  } else if (list.error && list.items.length === 0) {
    empty = <ErrorState error={list.error} onRetry={list.reload} />
  } else if (term) {
    empty = <EmptyState title="Sin resultados" description={`No encontramos movimientos que coincidan con "${term}".`} />
  } else {
    empty = (
      <EmptyState
        title="Aún no registras movimientos"
        description="Anota tu primer ingreso o gasto para verlo aquí."
        actionLabel="Registrar movimiento"
        onAction={() => router.push("/new-movement")}
      />
    )
  }

  const footer = list.isLoadingMore ? (
    <View className="py-4">
      <ActivityIndicator />
    </View>
  ) : list.loadMoreError ? (
    <View className="items-center gap-2 py-4">
      <Text className="text-sm text-muted-foreground">{userMessage(list.loadMoreError)}</Text>
      <Pressable onPress={list.loadMore} accessibilityRole="button" hitSlop={8}>
        <Text className="text-sm font-medium text-accent-ink">Reintentar</Text>
      </Pressable>
    </View>
  ) : null

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <FlatList
        data={list.items}
        keyExtractor={movementKey}
        renderItem={({ item }) => <MovementRow movement={item} onLongPress={() => confirmRemove(item)} />}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        contentContainerClassName="px-5 pb-28"
        keyboardShouldPersistTaps="handled"
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={list.isRefreshing} onRefresh={list.reload} />}
      />
      <Pressable
        onPress={() => router.push("/new-movement")}
        accessibilityRole="button"
        accessibilityLabel="Registrar movimiento"
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-80"
      >
        <Ionicons name="add" size={28} color={colors.primaryForeground} />
      </Pressable>
    </SafeAreaView>
  )
}
