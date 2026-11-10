/**
 * UUID v4 para el clientOrderId. Usa crypto.randomUUID cuando el runtime lo
 * trae y si no lo arma a mano: no hace falta que sea criptografico, solo unico
 * por orden del usuario.
 */
export function newUuid(): string {
  const native = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID
  if (native) return native.call((globalThis as { crypto: object }).crypto)

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16)
  })
}
