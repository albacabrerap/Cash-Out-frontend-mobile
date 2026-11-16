export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

/** SavingsGoalResponse */
export interface SavingsGoal {
  id: number
  name: string
  targetAmount: number
  accumulatedAmount: number
  /** 0-100 con dos decimales, calculado por el backend. */
  progressPercent: number
  /** yyyy-MM-dd */
  deadline: string

  status: GoalStatus
  completedAt: string | null
  createdAt: string
}

/** SavingsGoalRequest */
export interface SavingsGoalInput {
  name: string
  targetAmount: number
  deadline: string
}

export type ContributionSource = 'MANUAL' | 'INCOME' | 'ADJUSTMENT'

/** ContributionResponse */
export interface Contribution {
  id: number
  amount: number
  source: ContributionSource
  createdAt: string
}

/** ContributionRequest */
export interface ContributionInput {
  amount: number
  source: ContributionSource
}
