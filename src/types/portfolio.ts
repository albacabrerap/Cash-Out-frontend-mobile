/** Tipos del modulo de inversion simulada (paquete investment_portfolio del backend). */

export type OrderSide = "BUY" | "SELL"
export type OrderStatus = "PENDING" | "EXECUTED" | "REJECTED" | "CANCELLED"
export type AssetType = "ETF" | "FUND" | "STOCK" | "CRYPTO"

/** PositionResponse. Los tres ultimos campos son null si el activo no tiene cotizacion. */
export interface Position {
  id: number
  assetId: number
  symbol: string
  assetName: string
  quantity: number
  averageCost: number
  currentPrice: number | null
  marketValue: number | null
  unrealizedPnl: number | null
}

/** PortfolioResponse */
export interface Portfolio {
  id: number
  investedTokens: number
  simulatedValue: number
  unrealizedPnl: number
  realizedPnl: number
  positions: Position[]
  /** LocalDateTime en UTC. */
  updatedAt: string | null
}

/** AssetResponse */
export interface Asset {
  id: number
  symbol: string
  name: string
  type: AssetType
  currency: string
  active: boolean
  source: string
  exchange: string | null
}

/** AssetQuoteResponse */
export interface AssetQuote {
  symbol: string
  price: number
  previousClose: number | null
  changePercent: number | null
  currency: string
  updatedAt: string | null
}

/** TradeOrderRequest. clientOrderId lo genera el cliente para que un doble envio no compre dos veces. */
export interface TradeOrderInput {
  clientOrderId: string
  assetId: number
  side: OrderSide
  quantity: number
}

/** TradeOrderResponse. Las rechazadas tambien vuelven, con su motivo. */
export interface TradeOrder {
  id: number
  assetId: number
  symbol: string
  side: OrderSide
  quantity: number
  status: OrderStatus
  executionPrice: number | null
  tokensMoved: number | null
  tokenRate: number | null
  rejectionReason: string | null
  createdAt: string
  executedAt: string | null
}
