import { useAuth } from "@/hooks/useAuth"
import { Redirect } from "expo-router"

export default function NotFound() {
  const { status, endReason } = useAuth()
  if (status === "authenticated") return <Redirect href="/" />
  return <Redirect href={endReason ? "/login" : "/welcome"} />
}
