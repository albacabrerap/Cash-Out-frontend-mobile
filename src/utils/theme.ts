import { useColorScheme } from "react-native"

const light = {
  background: "#f8f8f9",
  foreground: "#181928",
  card: "#ffffff",
  primary: "#3f4058",
  primaryForeground: "#ffffff",
  mutedForeground: "#606174",
  border: "#cccccc",
  destructive: "#9a3e67",
  income: "#606939",
  expense: "#7f5175",
  series: ["#a35a98", "#c6852f", "#4f84c4", "#76962c", "#d66a88", "#8673d1", "#2d9a85"],
}

const dark: typeof light = {
  background: "#0c0c15",
  foreground: "#f1f1f5",
  card: "#141520",
  primary: "#cccccc",
  primaryForeground: "#0c0c15",
  mutedForeground: "#acadb7",
  border: "#3f4058",
  destructive: "#db87a8",
  income: "#b9bf97",
  expense: "#c8a4c3",
  series: ["#b56aa9", "#bf8233", "#5f92d2", "#7fa03a", "#d46e8b", "#9483dc", "#3aa892"],
}

export type ThemeColors = typeof light

export function useThemeColors(): ThemeColors {
  return useColorScheme() === "dark" ? dark : light
}
