import { AuthContext, type AuthContextValue } from '@/contexts/authContext'
import { use } from 'react'

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth tiene que usarse dentro de <AuthProvider>.')
  }
  return context
}