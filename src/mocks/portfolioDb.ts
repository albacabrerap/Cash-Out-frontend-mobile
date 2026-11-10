import type { TokenWallet } from "@/types/finance"
import type { Asset, AssetQuote, Portfolio, Position, TradeOrder, TradeOrderInput } from "@/types/portfolio"

/**
 * Cartera de ejemplo para el modo mock. Repite la logica del backend: comprar
 * descuenta fichas y abre o promedia la posicion; vender la reduce, devuelve
 * las fichas y materializa el PnL. Ademas un clientOrderId repetido devuelve la
 * misma orden, como la ruta idempotente real.
 */

const round2 = (value: number) => Math.round(value * 100) / 100
const nowServer = () => new Date().toISOString().slice(0, 19)
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 19)

const assets: Asset[] = [
  { id: 1, symbol: "AAPL", name: "Apple Inc.", type: "STOCK", currency: "USD", active: true, source: "ALPACA", exchange: "NASDAQ" },
  { id: 2, symbol: "NVDA", name: "NVIDIA Corporation", type: "STOCK", currency: "USD", active: true, source: "ALPACA", exchange: "NASDAQ" },
  { id: 3, symbol: "VOO", name: "Vanguard S&P 500 ETF", type: "ETF", currency: "USD", active: true, source: "ALPACA", exchange: "ARCA" },
  { id: 4, symbol: "BTC-USD", name: "Bitcoin", type: "CRYPTO", currency: "USD", active: true, source: "COINBASE", exchange: null },
  { id: 5, symbol: "MSFT", name: "Microsoft Corporation", type: "STOCK", currency: "USD", active: true, source: "ALPACA", exchange: "NASDAQ" },
  { id: 6, symbol: "ETH-USD", name: "Ethereum", type: "CRYPTO", currency: "USD", active: true, source: "COINBASE", exchange: null },
  { id: 7, symbol: "KO", name: "The Coca-Cola Company", type: "STOCK", currency: "USD", active: true, source: "ALPACA", exchange: "NYSE" },
]

const prices: Record<number, { price: number; previousClose: number }> = {
  1: { price: 231.4, previousClose: 228.9 },
  2: { price: 186.25, previousClose: 190.1 },
  3: { price: 548.7, previousClose: 545.2 },
  4: { price: 96850, previousClose: 95120 },
  5: { price: 512.3, previousClose: 509.8 },
  6: { price: 3620, previousClose: 3702 },
  7: { price: 71.15, previousClose: 70.9 },
}

const state = {
  balance: 4280,
  realizedPnl: 312.5,
  nextOrderId: 9,
  positions: [
    { assetId: 2, quantity: 18, averageCost: 162.4 },
    { assetId: 1, quantity: 12, averageCost: 205.1 },
    { assetId: 3, quantity: 4, averageCost: 560 },
    { assetId: 4, quantity: 0.015, averageCost: 88200 },
    { assetId: 7, quantity: 20, averageCost: 68.3 },
  ],
  orders: [] as TradeOrder[],
}

function asset(assetId: number): Asset {
  const found = assets.find((item) => item.id === assetId)
  if (!found) throw new Error(`Activo ${assetId} no existe en el mock`)
  return found
}

function buildOrder(
  id: number,
  input: Omit<TradeOrderInput, "clientOrderId">,
  status: TradeOrder["status"],
  createdAt: string,
  rejectionReason: string | null = null,
): TradeOrder {
  const price = prices[input.assetId].price
  const executed = status === "EXECUTED"
  return {
    id,
    assetId: input.assetId,
    symbol: asset(input.assetId).symbol,
    side: input.side,
    quantity: input.quantity,
    status,
    executionPrice: executed ? price : null,
    tokensMoved: executed ? round2(price * input.quantity) : null,
    tokenRate: 1,
    rejectionReason,
    createdAt,
    executedAt: executed ? createdAt : null,
  }
}

state.orders = [
  buildOrder(8, { assetId: 7, side: "BUY", quantity: 20 }, "EXECUTED", daysAgo(2)),
  buildOrder(7, { assetId: 4, side: "BUY", quantity: 0.015 }, "EXECUTED", daysAgo(5)),
  buildOrder(6, { assetId: 6, side: "BUY", quantity: 1.5 }, "REJECTED", daysAgo(6), "Saldo de fichas insuficiente."),
  buildOrder(5, { assetId: 3, side: "BUY", quantity: 4 }, "EXECUTED", daysAgo(9)),
  buildOrder(4, { assetId: 2, side: "SELL", quantity: 6 }, "EXECUTED", daysAgo(12)),
  buildOrder(3, { assetId: 2, side: "BUY", quantity: 24 }, "EXECUTED", daysAgo(20)),
]

const byClientId = new Map<string, TradeOrder>()

function toPosition(stored: (typeof state.positions)[number], index: number): Position {
  const { price } = prices[stored.assetId]
  const marketValue = round2(price * stored.quantity)
  return {
    id: index + 1,
    assetId: stored.assetId,
    symbol: asset(stored.assetId).symbol,
    assetName: asset(stored.assetId).name,
    quantity: stored.quantity,
    averageCost: stored.averageCost,
    currentPrice: price,
    marketValue,
    unrealizedPnl: round2(marketValue - stored.averageCost * stored.quantity),
  }
}

export class PortfolioMockError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const portfolioDb = {
  portfolio(): Portfolio {
    const positions = state.positions.map(toPosition)
    const invested = round2(state.positions.reduce((sum, p) => sum + p.averageCost * p.quantity, 0))
    const value = round2(positions.reduce((sum, p) => sum + (p.marketValue ?? 0), 0))
    return {
      id: 1,
      investedTokens: invested,
      simulatedValue: value,
      unrealizedPnl: round2(value - invested),
      realizedPnl: state.realizedPnl,
      positions,
      updatedAt: nowServer(),
    }
  },

  wallet(): TokenWallet {
    return { id: 1, tokenBalance: round2(state.balance), updatedAt: nowServer() }
  },

  orders(): TradeOrder[] {
    return state.orders
  },

  searchAssets(search: string): Asset[] {
    const query = search.trim().toLowerCase()
    return assets.filter(
      (item) => !query || item.symbol.toLowerCase().includes(query) || item.name.toLowerCase().includes(query),
    )
  },

  quote(assetId: number): AssetQuote {
    const found = assets.find((item) => item.id === assetId)
    if (!found) throw new PortfolioMockError(404, "No encontramos ese activo.")
    const { price, previousClose } = prices[assetId]
    return {
      symbol: found.symbol,
      price,
      previousClose,
      changePercent: round2(((price - previousClose) / previousClose) * 100),
      currency: found.currency,
      updatedAt: nowServer(),
    }
  },

  place(input: TradeOrderInput): { created: boolean; order: TradeOrder } {
    const previous = byClientId.get(input.clientOrderId)
    if (previous) return { created: false, order: previous }

    if (!assets.some((item) => item.id === input.assetId)) throw new PortfolioMockError(404, "No encontramos ese activo.")
    if (!(input.quantity > 0)) throw new PortfolioMockError(400, "La cantidad debe ser mayor que cero.")

    const { price } = prices[input.assetId]
    const cost = round2(price * input.quantity)
    const held = state.positions.find((p) => p.assetId === input.assetId)
    let status: TradeOrder["status"] = "EXECUTED"
    let reason: string | null = null

    if (input.side === "BUY") {
      if (cost > state.balance) {
        status = "REJECTED"
        reason = "Saldo de fichas insuficiente."
      } else {
        state.balance = round2(state.balance - cost)
        if (held) {
          const quantity = held.quantity + input.quantity
          held.averageCost = round2((held.averageCost * held.quantity + cost) / quantity)
          held.quantity = quantity
        } else {
          state.positions.push({ assetId: input.assetId, quantity: input.quantity, averageCost: price })
        }
      }
    } else if (!held || held.quantity < input.quantity) {
      status = "REJECTED"
      reason = "No tienes suficientes unidades para vender."
    } else {
      state.balance = round2(state.balance + cost)
      state.realizedPnl = round2(state.realizedPnl + (price - held.averageCost) * input.quantity)
      held.quantity = Math.round((held.quantity - input.quantity) * 1e6) / 1e6
      if (held.quantity <= 0) state.positions.splice(state.positions.indexOf(held), 1)
    }

    const order = buildOrder(state.nextOrderId++, input, status, nowServer(), reason)
    state.orders.unshift(order)
    byClientId.set(input.clientOrderId, order)
    return { created: true, order }
  },
}
