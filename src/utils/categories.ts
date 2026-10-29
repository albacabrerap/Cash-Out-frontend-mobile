import type { ComponentProps } from "react"
import type { Ionicons } from "@expo/vector-icons"
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/movements"

type IconName = ComponentProps<typeof Ionicons>["name"]

/** `seriesIndex` apunta a ThemeColors.series: cada categoria conserva su color. */
export const CATEGORY_META: Record<ExpenseCategory, { label: string; icon: IconName; seriesIndex: number }> = {
  FOOD: { label: "Comida", icon: "restaurant-outline", seriesIndex: 0 },
  TRANSPORT: { label: "Transporte", icon: "bus-outline", seriesIndex: 1 },
  SERVICES: { label: "Servicios", icon: "bulb-outline", seriesIndex: 2 },
  EDUCATION: { label: "Educación", icon: "school-outline", seriesIndex: 3 },
  LEISURE: { label: "Ocio", icon: "balloon-outline", seriesIndex: 4 },
  HEALTH: { label: "Salud", icon: "medkit-outline", seriesIndex: 5 },
  OTHER: { label: "Otros", icon: "shapes-outline", seriesIndex: 6 },
}

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && (EXPENSE_CATEGORIES as readonly string[]).includes(value)
}
