import * as SecureStore from "expo-secure-store"
import type { AuthResponse } from "@/types/auth"

const REFRESH_KEY = "cashout.refreshToken"

export type SessionEvent =
  | { type: "refreshed"; auth: AuthResponse }
  | { type: "cleared"; reason: SessionEndReason }

export type SessionEndReason = "logout" | "expired"

let accessToken: string | null = null
let refreshToken: string | null = null

let touched = false
let hydration: Promise<void> | null = null
let writeQueue: Promise<void> = Promise.resolve()
const listeners = new Set<(event: SessionEvent) => void>()

function enqueue(task: () => Promise<void>): void {

  writeQueue = writeQueue.then(task).catch(() => {})
}

function emit(event: SessionEvent): void {
  listeners.forEach((listener) => listener(event))
}

export const tokenStore = {

  hydrate(): Promise<void> {
    hydration ??= (async () => {
      try {
        const stored = await SecureStore.getItemAsync(REFRESH_KEY)
        if (!touched) refreshToken = stored
      } catch {
      }
    })()
    return hydration
  },

  getAccessToken(): string | null {
    return accessToken
  },

  getRefreshToken(): string | null {
    return refreshToken
  },

  setSession(auth: AuthResponse): void {
    touched = true
    accessToken = auth.accessToken
    refreshToken = auth.refreshToken
    const token = auth.refreshToken
    enqueue(() => SecureStore.setItemAsync(REFRESH_KEY, token))
    emit({ type: "refreshed", auth })
  },

  clear(reason: SessionEndReason): void {
    touched = true
    accessToken = null
    refreshToken = null
    enqueue(() => SecureStore.deleteItemAsync(REFRESH_KEY))
    emit({ type: "cleared", reason })
  },

  subscribe(listener: (event: SessionEvent) => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
