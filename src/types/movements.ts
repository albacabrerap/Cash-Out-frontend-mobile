export const EXPENSE_CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'SERVICES',
  'EDUCATION',
  'LEISURE',
  'HEALTH',
  'OTHER',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

/** ExpenseResponse */
export interface Expense {
  id: number
  category: ExpenseCategory
  amount: number
  /** yyyy-MM-dd */
  date: string
  description: string | null
  createdAt: string
}

/** ExpenseRequest */
export interface ExpenseInput {
  category: ExpenseCategory
  amount: number
  date: string
  description: string | null
}

/** IncomeResponse */
export interface Income {
  id: number
  amount: number
  source: string
  /** yyyy-MM-dd */
  date: string
  description: string | null
  createdAt: string
}

/** IncomeRequest */
export interface IncomeInput {
  amount: number
  source: string
  date: string
  description: string | null
}

export interface MovementFilters {
  search?: string
  from?: string
  to?: string
}

export interface ExpenseFilters extends MovementFilters {
  category?: ExpenseCategory
}


export interface Movement {

  id: number
  kind: 'INCOME' | 'EXPENSE'
  label: string | null
  /** Solo en gastos. */
  category: ExpenseCategory | null
  amount: number
  date: string
  createdAt: string
}


export interface MonthlyFlows {
  /** yyyy-MM */
  from: string
  to: string
  months: MonthlyFlow[]
  totalIncome: number
  totalExpense: number
  totalNet: number
}

export interface MonthlyFlow {
  /** yyyy-MM */
  month: string
  income: number
  expense: number
  /** Ingresos menos gastos del mes: lo que se ahorro. */
  net: number
}
