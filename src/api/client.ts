import { API_URL, USE_MOCKS } from "@/config"
import { mockAdapter } from "@/mocks/mockAdapter"
import type { AuthResponse } from "@/types/auth"
import { sleep } from "@/utils/sleep"
import axios, {
  isAxiosError,
  type AxiosAdapter,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"
import { ApiError, toApiError } from "./errors"
import { tokenStore } from "./tokenStore"

declare module "axios" {
  interface AxiosRequestConfig {
    /** En login/registro un 401 son credenciales incorrectas, no una sesion por renovar. */
    skipAuthRefresh?: boolean
  }
}

interface TrackedConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
  _sentToken?: string | null
  _retryCount?: number
}

/** Reintentos de lecturas que fallaron por red, timeout o 5xx. Las escrituras nunca se repiten solas. */
const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 600

export interface ApiClientOptions {
  baseURL: string
  timeoutMs?: number
  /** Solo para tests. */
  adapter?: AxiosAdapter
}

export interface ApiClient {
  http: AxiosInstance
  refreshSession(): Promise<AuthResponse>
}

export function createApiClient({ baseURL, timeoutMs = 15_000, adapter }: ApiClientOptions): ApiClient {
  const defaults = {
    baseURL,
    timeout: timeoutMs,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    adapter,
  }

  const http = axios.create(defaults)

  const bare = axios.create(defaults)

  let inFlight: Promise<AuthResponse> | null = null

  async function performRefresh(): Promise<AuthResponse> {
    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      throw new ApiError({ kind: "http", status: 401, serverMessage: "No hay una sesión activa." })
    }

    try {
      const { data } = await bare.post<AuthResponse>("/auth/refresh", { refreshToken })
      tokenStore.setSession(data)
      return data
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.status === 401) tokenStore.clear("expired")
      throw apiError
    }
  }

  function refreshSession(): Promise<AuthResponse> {
    inFlight ??= performRefresh().finally(() => {
      inFlight = null
    })
    return inFlight
  }


  http.interceptors.response.use(undefined, async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) throw error
    const config = error.config as TrackedConfig
    const attempts = config._retryCount ?? 0
    const isRead = (config.method ?? "get").toLowerCase() === "get"
    if (!isRead || attempts >= MAX_RETRIES || !toApiError(error).retryable) throw error

    config._retryCount = attempts + 1
    await sleep(RETRY_BASE_DELAY_MS * 2 ** attempts + Math.random() * 200, config.signal as AbortSignal | undefined)
    return http(config)
  })

  http.interceptors.request.use((config: TrackedConfig) => {
    const token = tokenStore.getAccessToken()
    config._sentToken = token
    if (token) config.headers.set("Authorization", `Bearer ${token}`)
    return config
  })

  http.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isAxiosError(error) || error.response?.status !== 401) {
        throw toApiError(error)
      }

      const config = error.config as TrackedConfig | undefined
      if (!config || config._retried || config.skipAuthRefresh) {
        throw toApiError(error)
      }
      config._retried = true

      const current = tokenStore.getAccessToken()
      if (current && current !== config._sentToken) {
        return http(config)
      }

      if (tokenStore.getRefreshToken() === null) {
        throw toApiError(error)
      }

      try {
        await refreshSession()
      } catch {
        throw toApiError(error)
      }
      return http(config)
    },
  )

  return { http, refreshSession }
}

export const api = createApiClient({ baseURL: API_URL, adapter: USE_MOCKS ? mockAdapter : undefined })

export const http = api.http
