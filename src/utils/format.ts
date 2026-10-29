
import { parseIsoDate } from "./dates"

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

const soles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const tokens = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 1234.5 → "S/ 1,234.50" */
export function formatSoles(amount: number | null | undefined): string {
  return soles.format(amount ?? 0)
}

/** 226.14 → "226.14 fichas" */
export function formatTokens(amount: number | null | undefined): string {
  return `${tokens.format(amount ?? 0)} fichas`
}

/**
 * El backend manda LocalDateTime sin zona, en la hora del servidor (UTC). Sin
 * marcarla como UTC se leeria como hora local, 5 horas corrida en Lima.
 */
export function parseServerDateTime(iso: string): Date {
  const hasZone = /(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(iso)
  return new Date(hasZone ? iso : `${iso}Z`)
}

function dayMonthYear(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
}

/** Fecha sin hora (LocalDate del backend): "2026-10-19" → "19 oct 2026". */
export function formatDate(iso: string | null | undefined): string {
  return iso ? dayMonthYear(parseIsoDate(iso)) : "—"
}

/** Solo el dia de una fecha con hora del backend, ya en hora local. */
export function formatServerDate(iso: string | null | undefined): string {
  return iso ? dayMonthYear(parseServerDateTime(iso)) : "—"
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

/** "Ana María Torres" → "AT" */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}
