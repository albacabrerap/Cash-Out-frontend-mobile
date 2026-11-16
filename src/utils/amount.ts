import { z } from 'zod'

const AMOUNT_PATTERN = /^\d{1,9}(?:[.,]\d{1,2})?$/

function amountString(missing: string) {
  return z
    .string()
    .trim()
    .min(1, { error: missing })
    .regex(AMOUNT_PATTERN, { error: 'Escribe un monto con hasta 2 decimales, como 25.50.' })
    .transform((value) => Number(value.replace(',', '.')))
}

export const amountField = amountString('Ingresa el monto.').refine((value) => value > 0, {
  error: 'El monto tiene que ser mayor que cero.',
})

export const amountOrZeroField = amountString('Ingresa el monto; puede ser 0.')

export function amountToField(value: number): string {
  return value.toFixed(2)
}

export function toCents(amount: number): number {
  return Math.round(amount * 100)
}
