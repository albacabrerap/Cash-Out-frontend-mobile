import type { Role } from "@/types/auth"
import type { GmailScanResult } from "@/types/autoRegister"

export const ROLE_LABEL: Record<Role, string> = { USER: "Estudiante", ADMIN: "Administrador", GUEST: "Invitado" }

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/gif"]
const AVATAR_MAX_BYTES = 2 * 1024 * 1024

export function avatarError(photo: { mimeType?: string | null; fileSize?: number | null }): string | null {
  if (photo.mimeType && !AVATAR_TYPES.includes(photo.mimeType)) return "La foto tiene que ser JPG, PNG o GIF."
  if (photo.fileSize && photo.fileSize > AVATAR_MAX_BYTES) return "La foto pesa más de 2 MB. Prueba con otra o recórtala más."
  return null
}

const monthYear = new Intl.DateTimeFormat("es-PE", { month: "short", year: "numeric" })

export function memberSince(createdAt: string): string {
  return `Desde ${monthYear.format(new Date(createdAt)).replace(".", "").replace(" de ", " ")}`
}

export function scanMessage({ read, added }: GmailScanResult): string {
  if (read === 0) return "No encontramos correos de consumo del BCP este mes."
  const mails = `Revisamos ${read} ${read === 1 ? "correo" : "correos"} del BCP de este mes`
  if (added === 0) return `${mails}: no hay movimientos nuevos.`
  return `${mails}: ${added} ${added === 1 ? "movimiento nuevo" : "movimientos nuevos"} en Movimientos.`
}

export const DELETE_WORD = "ELIMINAR"
