import type { AuthResponse, User } from "@/types/auth"
import type { Contribution, GoalStatus, SavingsGoal } from "@/types/goals"
import type { Expense, ExpenseCategory, Income } from "@/types/movements"
import { addDays, todayIso } from "@/utils/dates"

export const MOCK_CREDENTIALS = { email: "admin@cashout.dev", password: "mocktato123" }
export const MOCK_ACCESS_TOKEN = "mock-access"
export const MOCK_REFRESH_TOKEN = "mock-refresh"

export const MOCK_USER: User = {
  id: 1,
  name: "Admin Cash-Out",
  email: MOCK_CREDENTIALS.email,
  roles: ["ADMIN", "USER"],
  status: "ACTIVE",
  birthDate: "2002-05-14",
  createdAt: "2026-01-10T15:00:00",
}

export function buildAuthResponse(user: User = MOCK_USER): AuthResponse {
  return {
    accessToken: MOCK_ACCESS_TOKEN,
    refreshToken: MOCK_REFRESH_TOKEN,
    tokenType: "Bearer",
    expiresIn: 3600,
    user,
  }
}

const ago = (days: number) => addDays(todayIso(), -days)
const at = (days: number) => `${ago(days)}T15:00:00`

function income(id: number, source: string, amount: number, days: number, description: string | null): Income {
  return { id, source, amount, date: ago(days), description, createdAt: at(days) }
}

function expense(
  id: number,
  category: ExpenseCategory,
  amount: number,
  days: number,
  description: string | null,
): Expense {
  return { id, category, amount, date: ago(days), description, createdAt: at(days) }
}

export type StoredGoal = Omit<SavingsGoal, "progressPercent" | "status">

export const db = {
  incomes: [
    income(1, "Coms", 1850, 21, "Comisión de dibujo"),
    income(2, "Mesada", 300, 6, null),
    income(3, "Freelance", 420, 12, "Diseño de logo"),
    income(4, "Coms", 1350, 21, "Comisión de dibujo"),
  ] as Income[],
  expenses: [
    expense(1, "FOOD", 28.5, 1, "3 sandwiches de Listo"),
    expense(2, "TRANSPORT", 12, 1, "Pasajes"),
    expense(3, "FOOD", 64.9, 3, "Langostinos congelados tempura"),
    expense(4, "LEISURE", 45, 4, "Entradas Dr. Doom 18 de dic"),
    expense(5, "SERVICES", 89.9, 5, "Internet"),
    expense(6, "EDUCATION", 120, 7, "Libro para AED y Teo"),
    expense(7, "HEALTH", 35, 8, "KT tape"),
    expense(8, "FOOD", 22, 9, "Almuerzo FreshIt"),
    expense(9, "TRANSPORT", 18, 10, "Taxi"),
    expense(10, "LEISURE", 400, 14, "Concierto Slipknot"),
    expense(11, "FOOD", 41.5, 15, "Cafe en fu cafe"),
    expense(12, "SERVICES", 59, 18, "Entel"),
    expense(13, "OTHER", 25, 20, null),
    expense(14, "EDUCATION", 85, 23, "Curso de excel coursera"),
    expense(15, "FOOD", 33, 25, "Sushi"),
    expense(16, "TRANSPORT", 30, 28, "Recarga de tarjeta"),
    expense(17, "LEISURE", 38, 33, "Silksong (en oferta)"),
    expense(18, "FOOD", 52, 40, "Compras de la semana"),
    expense(19, "SERVICES", 89.9, 35, "Luz"),
    expense(20, "HEALTH", 60, 45, "Consulta"),
  ] as Expense[],
  goals: [
    {
      id: 1,
      name: "Laptop",
      targetAmount: 6500,
      accumulatedAmount: 1200,
      deadline: addDays(todayIso(), 120),
      completedAt: null,
      createdAt: at(60),
    },
    {
      id: 2,
      name: "Viaje a Cusco",
      targetAmount: 1500,
      accumulatedAmount: 1125,
      deadline: addDays(todayIso(), 60),
      completedAt: null,
      createdAt: at(80),
    },
    {
      id: 3,
      name: "Fondo de emergencia",
      targetAmount: 2000,
      accumulatedAmount: 2000,
      deadline: addDays(todayIso(), -10),
      completedAt: at(15),
      createdAt: at(150),
    },
  ] as StoredGoal[],
  contributions: {
    1: [
      { id: 2, amount: 400, source: "MANUAL", createdAt: at(10) },
      { id: 1, amount: 800, source: "INCOME", createdAt: at(30) },
    ],
    2: [{ id: 3, amount: 1125, source: "MANUAL", createdAt: at(12) }],
  } as Record<number, Contribution[]>,
  nextId: { income: 5, expense: 21, goal: 4, contribution: 4 },
}

export function deriveGoal(goal: StoredGoal): SavingsGoal {
  const status: GoalStatus = goal.completedAt ? "COMPLETED" : goal.deadline < todayIso() ? "EXPIRED" : "IN_PROGRESS"
  const progressPercent = Math.min(100, Math.round((goal.accumulatedAmount / goal.targetAmount) * 10_000) / 100)
  return { ...goal, progressPercent, status }
}

const round2 = (value: number) => Math.round(value * 100) / 100


export function computeSavings() {
  const incomes = db.incomes.reduce((sum, item) => sum + item.amount, 0)
  const expenses = db.expenses.reduce((sum, item) => sum + item.amount, 0)
  const committed = db.goals
    .map(deriveGoal)
    .filter((goal) => goal.status === "IN_PROGRESS")
    .reduce((sum, goal) => sum + goal.accumulatedAmount, 0)
  const currentBalance = round2(incomes - expenses)
  return {
    id: 1,
    currentBalance,
    committedAmount: round2(committed),
    availableBalance: round2(currentBalance - committed),
    updatedAt: new Date().toISOString().slice(0, 19),
  }
}
