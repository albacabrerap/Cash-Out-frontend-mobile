import { fetch } from "expo/fetch"
import { api } from "@/api/client"
import { ApiError } from "@/api/errors"
import { tokenStore } from "@/api/tokenStore"
import { API_URL } from "@/config"
import { createSseParser, type SseEvent } from "@/lib/sse"

type StreamResponse = Awaited<ReturnType<typeof fetch>>


async function open(path: string, signal: AbortSignal, retried = false): Promise<StreamResponse> {
  const token = tokenStore.getAccessToken()
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "text/event-stream", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    signal,
  })
  if (response.status === 401 && !retried && tokenStore.getRefreshToken()) {
    await api.refreshSession()
    return open(path, signal, true)
  }
  if (!response.ok || !response.body) throw new ApiError({ kind: "http", status: response.status })
  return response
}


export async function streamEvents(path: string, onEvent: (event: SseEvent) => void, signal: AbortSignal) {
  const response = await open(path, signal)
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  const parse = createSseParser(onEvent)
  for (;;) {
    const { value, done } = await reader.read()
    if (done) return
    parse(decoder.decode(value, { stream: true }))
  }
}
