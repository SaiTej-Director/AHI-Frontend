// Expo runtime config (needed because process.env is not reliably available at runtime in Expo Go).
// We keep IDs out of code by reading from env and injecting into `expo.extra`.

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...(config.extra || {}),

      // Google OAuth client IDs
      googleWebClientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      googleAndroidClientId:
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,

      // Optional override for backend base URL (e.g. physical device IP)
      backendBaseUrl: process.env.EXPO_PUBLIC_BACKEND_URL,
    },
  }
}

