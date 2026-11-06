import { http } from "@/api/client"
import { compactParams } from "@/api/params"
import type { PageParams, PageResponse } from "@/types/api"
import type { MonthlyFlows, Movement, MovementFilters } from "@/types/movements"

/** Ingresos y gastos juntos, solo lectura. Crear, editar y borrar va por sus propios servicios. */
export const movementService = {
  async list(params: PageParams & MovementFilters, signal?: AbortSignal): Promise<PageResponse<Movement>> {
    const { data } = await http.get<PageResponse<Movement>>("/movements", { params: compactParams(params), signal })
    return data
  },

  /** Totales por mes hasta el mes en curso. Sin `months`, desde el primer movimiento. */
  async monthly(months: number | undefined, signal?: AbortSignal): Promise<MonthlyFlows> {
    const { data } = await http.get<MonthlyFlows>("/movements/monthly", { params: compactParams({ months }), signal })
    return data
  },
}
