import type { ApiError } from '@/api/errors'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'


export function applyServerFieldErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  messages: Partial<Record<Path<T>, string>> = {},
): boolean {
  let applied = false
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (!(fields as readonly string[]).includes(field)) continue
    setError(field as Path<T>, { type: 'server', message: messages[field as Path<T>] ?? message }, { shouldFocus: !applied })
    applied = true
  }
  return applied
}
