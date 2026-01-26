import { Platform } from "react-native"
import Constants from "expo-constants"
import * as Device from "expo-device"

function deriveHostFromExpo(): string | null {
  const anyConstants: any = Constants as any
  const hostUri: string | undefined =
    anyConstants?.expoConfig?.hostUri ||
    anyConstants?.manifest?.debuggerHost ||
    anyConstants?.manifest2?.extra?.expoClient?.hostUri

  if (!hostUri) return null
  const stripped = String(hostUri).replace(/^(exp|exps|http|https):\/\//, "")
  const hostname = stripped.split(":")[0]
  return hostname || null
}

function getExtraOverride(): string | null {
  const anyConstants: any = Constants as any
  const extra =
    anyConstants?.expoConfig?.extra ||
    anyConstants?.manifest?.extra ||
    anyConstants?.manifest2?.extra ||
    null

  const override = extra?.backendBaseUrl as string | undefined
  return override || null
}

export const API_BASE_URL: string = (() => {
  const override = getExtraOverride()
  if (override) return override

  // Android emulator: always go through 10.0.2.2 to reach host machine.
  if (Platform.OS === "android" && Device.isDevice === false) {
    return "http://10.0.2.2:3001"
  }

  // Web: keep same host, port 3001.
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `http://${window.location.hostname}:3001`
  }

  // Physical device / iOS simulator: use Expo host IP if available.
  const host = deriveHostFromExpo()
  if (host) return `http://${host}:3001`

  // Last resort.
  return Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001"
})()

