import { http } from "@/api/client"
import type { Minigame, MinigameSession, MinigameSessionInput } from "@/types/minigames"

export const minigameService = {
  /** Solo los publicados: borradores y archivados son de administración. */
  async list(signal?: AbortSignal): Promise<Minigame[]> {
    const { data } = await http.get<Minigame[]>("/minigames", { signal })
    return data
  },

  async get(id: number, signal?: AbortSignal): Promise<Minigame> {
    const { data } = await http.get<Minigame>(`/minigames/${id}`, { signal })
    return data
  },

  /** Del más reciente al más antiguo. El backend no las pagina. */
  async sessions(signal?: AbortSignal): Promise<MinigameSession[]> {
    const { data } = await http.get<MinigameSession[]>("/minigame-sessions", { signal })
    return data
  },

  /** Cobra el costo y acredita la recompensa en una sola operación. */
  async play(input: MinigameSessionInput): Promise<MinigameSession> {
    const { data } = await http.post<MinigameSession>("/minigame-sessions", input)
    return data
  },
}
