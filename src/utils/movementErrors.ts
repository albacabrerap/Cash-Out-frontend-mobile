import { toApiError, userMessage } from '@/api/errors'

export function incomeDeleteErrorMessage(err: unknown): string {
  const error = toApiError(err)
  if (error.status === 400) {
    return 'No puedes eliminar este ingreso: parte de ese dinero está reservado en tus metas. Libera la meta primero o corrige el monto del ingreso.'
  }
  return userMessage(error)
}
