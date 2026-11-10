/** Verde si gana, rojo si pierde, neutro en cero o sin dato. */
export function pnlTextClass(value: number | null | undefined): string {
  if (value == null || value === 0) return "text-muted-foreground"
  return value > 0 ? "text-gain" : "text-loss"
}
