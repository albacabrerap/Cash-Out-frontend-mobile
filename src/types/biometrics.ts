import * as LocalAuthentication from "expo-local-authentication"
import * as SecureStore from "expo-secure-store"
import { useState } from "react"
import { Platform } from "react-native"

const KEY = "cashout.biometrics"

export interface BiometricSupport {
  available: boolean
  label: string
  reason?: string
}

export async function biometricSupport(): Promise<BiometricSupport> {
  if (Platform.OS === "web") return { available: false, label: "huella", reason: "La vista web no tiene lector de huella." }
  try {
    const [hardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ])
    const face = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    const finger = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    const label = face && finger ? "huella o rostro" : face ? "rostro" : "huella"
    if (!hardware) return { available: false, label, reason: "Tu celular no tiene lector de huella ni reconocimiento facial." }
    if (!enrolled) return { available: false, label, reason: `Primero registra tu ${label} en los ajustes del celular.` }
    return { available: true, label }
  } catch {
    return { available: false, label: "huella", reason: "No pudimos revisar el lector de huella." }
  }
}

export async function authenticate(promptMessage: string): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: "Cancelar", disableDeviceFallback: false })
    return result.success
  } catch {
    return false
  }
}

export function isBiometricsEnabled(): boolean {
  try {
    return SecureStore.getItem(KEY) === "on"
  } catch {
    return false
  }
}

function save(on: boolean): void {
  try {
    if (on) SecureStore.setItem(KEY, "on")
    else void SecureStore.deleteItemAsync(KEY)
  } catch {
    
  }
}

export function useBiometricsPreference(): [boolean, (on: boolean) => void] {
  const [enabled, setEnabled] = useState(isBiometricsEnabled)
  const set = (on: boolean) => {
    save(on)
    setEnabled(on)
  }
  return [enabled, set]
}

export async function confirmWithBiometrics(promptMessage: string): Promise<boolean> {
  if (!isBiometricsEnabled()) return true
  return authenticate(promptMessage)
}
