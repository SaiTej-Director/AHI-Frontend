import Constants from "expo-constants"

const anyConstants: any = Constants as any

const extra =
  anyConstants?.expoConfig?.extra ||
  anyConstants?.manifest?.extra ||
  anyConstants?.manifest2?.extra ||
  {}

export const GOOGLE_AUTH_CONFIG = {
  webClientId: extra.googleWebClientId as string | undefined,
  androidClientId: extra.googleAndroidClientId as string | undefined,
} as const

