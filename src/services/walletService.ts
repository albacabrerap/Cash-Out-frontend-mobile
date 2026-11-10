import { http } from "@/api/client"
import type { PageParams, PageResponse } from "@/types/api"
import type { TokenTransaction, TokenWallet } from "@/types/finance"

/** Billetera de fichas del usuario autenticado. */
export const walletService = {
  async get(signal?: AbortSignal): Promise<TokenWallet> {
    const { data } = await http.get<TokenWallet>("/token-wallet", { signal })
    return data
  },

  /** Movimientos de fichas, del más reciente al más antiguo. */
  async transactions(params: PageParams, signal?: AbortSignal): Promise<PageResponse<TokenTransaction>> {
    const { data } = await http.get<PageResponse<TokenTransaction>>("/token-wallet/transactions", {
      params,
      signal,
    })
    return data
  },
}
