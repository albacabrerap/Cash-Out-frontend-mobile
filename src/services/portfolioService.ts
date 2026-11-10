import { http } from "@/api/client"
import type { PageParams, PageResponse } from "@/types/api"
import type { TokenWallet } from "@/types/finance"
import type { Asset, AssetQuote, Portfolio, TradeOrder, TradeOrderInput } from "@/types/portfolio"

/** Cartera simulada del usuario autenticado. Recurso singular y de solo lectura. */
export const portfolioService = {
  /** Posiciones valoradas con la cotizacion del momento, mas el PnL realizado y no realizado. */
  async get(signal?: AbortSignal): Promise<Portfolio> {
    const { data } = await http.get<Portfolio>("/portfolio", { signal })
    return data
  },
}

/** Saldo de fichas. Solo lectura: las fichas se mueven por efecto de metas, minijuegos u ordenes. */
export const walletService = {
  async get(signal?: AbortSignal): Promise<TokenWallet> {
    const { data } = await http.get<TokenWallet>("/token-wallet", { signal })
    return data
  },
}

export const assetService = {
  /** Catalogo activo. `search` busca en simbolo y nombre, con el simbolo exacto primero. */
  async search(search: string, signal?: AbortSignal): Promise<PageResponse<Asset>> {
    const { data } = await http.get<PageResponse<Asset>>("/assets", {
      params: { search: search.trim() || undefined, size: 15 },
      signal,
    })
    return data
  },

  async quote(assetId: number, signal?: AbortSignal): Promise<AssetQuote> {
    const { data } = await http.get<AssetQuote>(`/assets/${assetId}/quote`, { signal })
    return data
  },
}

export const orderService = {
  /** Historial paginado. El backend ya lo ordena del mas reciente al mas antiguo. */
  async list(params: PageParams, signal?: AbortSignal): Promise<PageResponse<TradeOrder>> {
    const { data } = await http.get<PageResponse<TradeOrder>>("/orders", { params, signal })
    return data
  },

  /**
   * Responde 201 aunque la orden salga REJECTED: el recurso se creo con su motivo.
   * Hay que leer `status`, no basta con que la peticion no falle.
   */
  async place(input: TradeOrderInput): Promise<TradeOrder> {
    const { data } = await http.post<TradeOrder>("/orders", input)
    return data
  },
}
