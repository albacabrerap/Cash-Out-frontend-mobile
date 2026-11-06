
import type { PageResponse } from "@/types/api"
import type { ContributionInput, SavingsGoalInput } from "@/types/goals"
import type { ExpenseInput, IncomeInput, Movement } from "@/types/movements"
import { CATEGORY_META } from "@/utils/categories"
import { expenseToMovement, incomeToMovement } from "@/utils/movements"
import { sleep } from "@/utils/sleep"
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"
import {
  MOCK_CREDENTIALS,
  MOCK_REFRESH_TOKEN,
  MOCK_USER,
  buildAuthResponse,
  computeSavings,
  db,
  deriveGoal,
} from "./db"

const DELAY_MS = 450
const FAIL_RATE = Number(process.env.EXPO_PUBLIC_MOCK_FAIL_RATE ?? 0)

class MockHttpError extends Error {
  readonly status: number
  readonly fieldErrors?: { field: string; message: string }[]

  constructor(status: number, message: string, fieldErrors?: { field: string; message: string }[]) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface Context {
  params: Record<string, unknown>
  body: any
  match: RegExpMatchArray
}
type Handler = (ctx: Context) => { status?: number; data?: unknown }

const money = (value: number) => value.toFixed(2)

function paginate<T>(items: T[], params: Record<string, unknown>): PageResponse<T> {
  const size = Math.min(Math.max(Number(params.size) || 20, 1), 500)
  const page = Math.max(Number(params.page) || 0, 0)
  return {
    content: items.slice(page * size, (page + 1) * size),
    page,
    size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
  }
}

function allMovements(): Movement[] {
  return [...db.incomes.map(incomeToMovement), ...db.expenses.map(expenseToMovement)].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  )
}

function requireAmount(amount: unknown) {
  if (typeof amount !== "number" || !(amount > 0)) {
    throw new MockHttpError(400, "Revisa los datos ingresados.", [
      { field: "amount", message: "El monto debe ser mayor que cero." },
    ])
  }
  return amount
}

const routes: [string, RegExp, Handler][] = [
  // --- Auth
  [
    "POST",
    /^\/auth\/login$/,
    ({ body }) => {
      if (body.email !== MOCK_CREDENTIALS.email || body.password !== MOCK_CREDENTIALS.password) {
        throw new MockHttpError(401, "Correo o contraseña incorrectos.")
      }
      return { data: buildAuthResponse() }
    },
  ],
  [
    "POST",
    /^\/auth\/register$/,
    ({ body }) => ({
      status: 201,
      data: buildAuthResponse({ ...MOCK_USER, id: 2, name: body.name, email: body.email, roles: ["USER"] }),
    }),
  ],
  [
    "POST",
    /^\/auth\/refresh$/,
    ({ body }) => {
      if (body.refreshToken !== MOCK_REFRESH_TOKEN) throw new MockHttpError(401, "La sesión no es válida.")
      return { data: buildAuthResponse() }
    },
  ],
  ["POST", /^\/auth\/logout$/, () => ({ status: 204 })],

  // --- Ahorro y movimientos
  ["GET", /^\/savings$/, () => ({ data: computeSavings() })],
  [
    "GET",
    /^\/movements$/,
    ({ params }) => {
      const search = String(params.search ?? "").trim().toLowerCase()
      const from = params.from ? String(params.from) : undefined
      const to = params.to ? String(params.to) : undefined
      const filtered = allMovements().filter((movement) => {
        if (from && movement.date < from) return false
        if (to && movement.date > to) return false
        if (!search) return true
        const category = movement.category ? CATEGORY_META[movement.category].label : ""
        return `${movement.label ?? ""} ${category}`.toLowerCase().includes(search)
      })
      return { data: paginate(filtered, params) }
    },
  ],
  [
    "POST",
    /^\/incomes$/,
    ({ body }) => {
      const input = body as IncomeInput
      requireAmount(input.amount)
      const created = { id: db.nextId.income++, ...input, createdAt: new Date().toISOString().slice(0, 19) }
      db.incomes.push(created)
      return { status: 201, data: created }
    },
  ],
  [
    "POST",
    /^\/expenses$/,
    ({ body }) => {
      const input = body as ExpenseInput
      requireAmount(input.amount)
      const { availableBalance } = computeSavings()
      if (input.amount > availableBalance) {
        throw new MockHttpError(400, `El gasto supera tu saldo disponible de ${money(availableBalance)}.`)
      }
      const created = { id: db.nextId.expense++, ...input, createdAt: new Date().toISOString().slice(0, 19) }
      db.expenses.push(created)
      return { status: 201, data: created }
    },
  ],
  [
    "DELETE",
    /^\/incomes\/(\d+)$/,
    ({ match }) => {
      const index = db.incomes.findIndex((item) => item.id === Number(match[1]))
      if (index < 0) throw new MockHttpError(404, "No encontramos ese ingreso.")
      const removed = db.incomes[index]
      if (removed.amount > computeSavings().availableBalance) throw new MockHttpError(400, "Saldo insuficiente.")
      db.incomes.splice(index, 1)
      return { status: 204 }
    },
  ],
  [
    "DELETE",
    /^\/expenses\/(\d+)$/,
    ({ match }) => {
      const index = db.expenses.findIndex((item) => item.id === Number(match[1]))
      if (index < 0) throw new MockHttpError(404, "No encontramos ese gasto.")
      db.expenses.splice(index, 1)
      return { status: 204 }
    },
  ],
//metas
  ["GET", /^\/savings-goals$/, () => ({ data: db.goals.map(deriveGoal).sort((a, b) => a.deadline.localeCompare(b.deadline)) })],
  [
    "GET",
    /^\/savings-goals\/(\d+)$/,
    ({ match }) => {
      const goal = db.goals.find((item) => item.id === Number(match[1]))
      if (!goal) throw new MockHttpError(404, "No encontramos esa meta.")
      return { data: deriveGoal(goal) }
    },
  ],
  [
    "POST",
    /^\/savings-goals$/,
    ({ body }) => {
      const input = body as SavingsGoalInput
      const goal = {
        id: db.nextId.goal++,
        name: input.name,
        targetAmount: input.targetAmount,
        accumulatedAmount: 0,
        deadline: input.deadline,
        completedAt: null,
        createdAt: new Date().toISOString().slice(0, 19),
      }
      db.goals.push(goal)
      return { status: 201, data: deriveGoal(goal) }
    },
  ],
  [
    "DELETE",
    /^\/savings-goals\/(\d+)$/,
    ({ match }) => {
      const index = db.goals.findIndex((item) => item.id === Number(match[1]))
      if (index < 0) throw new MockHttpError(404, "No encontramos esa meta.")
      db.goals.splice(index, 1)
      return { status: 204 }
    },
  ],
  [
    "GET",
    /^\/savings-goals\/(\d+)\/contributions$/,
    ({ match }) => ({ data: db.contributions[Number(match[1])] ?? [] }),
  ],
  [
    "POST",
    /^\/savings-goals\/(\d+)\/contributions$/,
    ({ match, body }) => {
      const goal = db.goals.find((item) => item.id === Number(match[1]))
      if (!goal) throw new MockHttpError(404, "No encontramos esa meta.")
      const input = body as ContributionInput
      requireAmount(input.amount)
      if (deriveGoal(goal).status !== "IN_PROGRESS") throw new MockHttpError(400, "Esta meta ya no admite aportes.")
      const { availableBalance } = computeSavings()
      if (input.amount > availableBalance) {
        throw new MockHttpError(400, `El aporte supera tu saldo disponible de ${money(availableBalance)}.`)
      }
      goal.accumulatedAmount += input.amount
      if (goal.accumulatedAmount >= goal.targetAmount) goal.completedAt = new Date().toISOString().slice(0, 19)
      const contribution = {
        id: db.nextId.contribution++,
        amount: input.amount,
        source: input.source,
        createdAt: new Date().toISOString().slice(0, 19),
      }
      db.contributions[goal.id] = [contribution, ...(db.contributions[goal.id] ?? [])]
      return { status: 201, data: contribution }
    },
  ],
]

const STATUS_NAMES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  409: "Conflict",
}

function buildResponse(config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosResponse {
  return { data, status, statusText: String(status), headers: {}, config, request: {} }
}

function toAxiosError(config: InternalAxiosRequestConfig, failure: MockHttpError): AxiosError {
  const body = {
    timestamp: new Date().toISOString().slice(0, 23),
    status: failure.status,
    error: STATUS_NAMES[failure.status] ?? "Error",
    message: failure.message,
    path: config.url ?? "",
    ...(failure.fieldErrors ? { fieldErrors: failure.fieldErrors } : {}),
  }
  const code = failure.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST
  return new AxiosError(failure.message, code, config, {}, buildResponse(config, failure.status, body))
}

export const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? "get").toUpperCase()
  const path = (config.url ?? "").replace(config.baseURL ?? "", "").split("?")[0]
  const isAuth = path.startsWith("/auth/")

  await sleep(DELAY_MS + Math.random() * 250, config.signal as AbortSignal | undefined)


  if (!isAuth && Math.random() < FAIL_RATE) {
    throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, {})
  }

  const body = typeof config.data === "string" && config.data ? JSON.parse(config.data) : (config.data ?? {})

  for (const [routeMethod, pattern, handler] of routes) {
    const match = path.match(pattern)
    if (routeMethod !== method || !match) continue
    try {
      const { status = 200, data } = handler({ params: (config.params ?? {}) as Record<string, unknown>, body, match })
      return buildResponse(config, status, data)
    } catch (error) {
      if (error instanceof MockHttpError) throw toAxiosError(config, error)
      throw error
    }
  }

  throw toAxiosError(
    config,
    new MockHttpError(404, `Mock: todavía no hay datos de ejemplo para ${method} ${path}.`),
  )
}
