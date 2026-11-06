import type { Expense, Income, Movement } from "@/types/movements"
import { parseIsoDate, todayIso } from "./dates"

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

/** Gastos e ingresos se listan con la misma forma que el listado unificado. */
export function expenseToMovement(expense: Expense): Movement {
  return {
    id: expense.id,
    kind: "EXPENSE",
    label: expense.description,
    category: expense.category,
    amount: expense.amount,
    date: expense.date,
    createdAt: expense.createdAt,
  }
}

export function incomeToMovement(income: Income): Movement {
  return {
    id: income.id,
    kind: "INCOME",
    label: income.source,
    category: null,
    amount: income.amount,
    date: income.date,
    createdAt: income.createdAt,
  }
}

/** "2026-10-19" → "19 oct"; si es de otro año, "19 oct 2025". */
export function formatDayMonth(iso: string, today: string = todayIso()): string {
  const date = parseIsoDate(iso)
  const text = `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
  return iso.slice(0, 4) === today.slice(0, 4) ? text : `${text} ${iso.slice(0, 4)}`
}

/** Un ingreso y un gasto pueden compartir id: la clave de lista lleva el tipo. */
export function movementKey(movement: Pick<Movement, "id" | "kind">): string {
  return `${movement.kind}-${movement.id}`
}
