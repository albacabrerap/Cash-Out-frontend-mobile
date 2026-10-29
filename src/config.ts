
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "")


export const USE_MOCKS = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS === "true"

if (!API_URL && !USE_MOCKS) {
  console.warn(
    "Falta EXPO_PUBLIC_API_URL.",
  )
}
