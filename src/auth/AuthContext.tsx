import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { saveDisplayName } from "../storage/userProfile"

type AuthUser = {
  id: string
  email: string
  googleId?: string | null
  displayName?: string | null
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  // Privacy-first identity (do not bind UI directly to Google payload)
  isAuthenticated: boolean
  userId: string | null
  profilePhoto: string | null

  // Shared identity name (privacy-first)
  headerName: string
  accountName: string
  accountNameCustom: boolean
  setHeaderName: (name: string) => Promise<void>

  setProfilePhoto: (uri: string) => Promise<void>
  removeProfilePhoto: () => Promise<void>

  // Back-compat
  isLoggedIn: boolean
  setAuth: (token: string, user: AuthUser) => Promise<void>
  logout: () => Promise<void>
}

const AUTH_TOKEN_KEY = "ahi_auth_token_v1"
const AUTH_USER_KEY = "ahi_auth_user_v1"
const HEADER_NAME_KEY = "ahi_user_display_name" // keep existing key
const ACCOUNT_NAME_KEY = "ahi_account_name_v1"
const ACCOUNT_NAME_CUSTOM_KEY = "ahi_account_name_custom_v1"
const PROFILE_PHOTO_KEY = "ahi_profile_photo_v1"
const UI_SCHEMA_KEY = "ahi_ui_schema_version_v1"
const UI_SCHEMA_VERSION = "2026-01-24-night"

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [headerName, setHeaderNameState] = useState("You")
  const [accountName, setAccountNameState] = useState("You")
  const [accountNameCustom, setAccountNameCustom] = useState(false)

  const isLoggedIn = Boolean(token && user)
  const isAuthenticated = isLoggedIn
  const userId = user?.id ?? null
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const storedSchema = await AsyncStorage.getItem(UI_SCHEMA_KEY)
      if (storedSchema && storedSchema !== UI_SCHEMA_VERSION) {
        await AsyncStorage.removeItem(HEADER_NAME_KEY)
        await AsyncStorage.removeItem(ACCOUNT_NAME_KEY)
        await AsyncStorage.removeItem(ACCOUNT_NAME_CUSTOM_KEY)
        await AsyncStorage.removeItem(PROFILE_PHOTO_KEY)
        console.warn("[UI_SCHEMA_RESET]")
      }
      await AsyncStorage.setItem(UI_SCHEMA_KEY, UI_SCHEMA_VERSION)

      const t = await AsyncStorage.getItem(AUTH_TOKEN_KEY)
      const uRaw = await AsyncStorage.getItem(AUTH_USER_KEY)
      setToken(t)
      setUser(uRaw ? JSON.parse(uRaw) : null)

      // Load shared identity names (privacy-first)
      const savedHeader = await AsyncStorage.getItem(HEADER_NAME_KEY)
      const initialHeader = savedHeader || "You"
      setHeaderNameState(initialHeader)

      const savedAccount = await AsyncStorage.getItem(ACCOUNT_NAME_KEY)
      const savedCustomRaw = await AsyncStorage.getItem(ACCOUNT_NAME_CUSTOM_KEY)
      const savedCustom = savedCustomRaw === "true"
      setAccountNameCustom(savedCustom)

      // If user never set a custom account name, keep it linked to headerName.
      const initialAccount = savedAccount || initialHeader
      setAccountNameState(initialAccount)
      if (!savedCustom) {
        await AsyncStorage.setItem(ACCOUNT_NAME_KEY, initialHeader)
        await AsyncStorage.setItem(ACCOUNT_NAME_CUSTOM_KEY, "false")
      }

      const savedPhoto = await AsyncStorage.getItem(PROFILE_PHOTO_KEY)
      setProfilePhotoState(savedPhoto || null)
    })()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isLoggedIn,
      isAuthenticated,
      userId,
      profilePhoto,
      headerName,
      accountName,
      accountNameCustom,
      setHeaderName: async (name) => {
        const next = name.trim() || "You"
        setHeaderNameState(next)
        await AsyncStorage.setItem(HEADER_NAME_KEY, next)

        // Sync account name only when not custom.
        if (!accountNameCustom) {
          setAccountNameState(next)
          await AsyncStorage.setItem(ACCOUNT_NAME_KEY, next)
        }
      },
      setProfilePhoto: async (uri) => {
        const next = uri || ""
        setProfilePhotoState(next || null)
        if (next) {
          await AsyncStorage.setItem(PROFILE_PHOTO_KEY, next)
        } else {
          await AsyncStorage.removeItem(PROFILE_PHOTO_KEY)
        }
      },
      removeProfilePhoto: async () => {
        setProfilePhotoState(null)
        await AsyncStorage.removeItem(PROFILE_PHOTO_KEY)
      },
      setAuth: async (t, u) => {
        setToken(t)
        setUser(u)
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, t)
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(u))

        // Normalize auth → identity (yesterday's UI reads from ahi_user_display_name)
        if (t && u) {
          const anyUser = u as any
          const derived =
            (typeof anyUser?.name === "string" && anyUser.name.trim()) ||
            (typeof anyUser?.username === "string" && anyUser.username.trim()) ||
            (typeof anyUser?.email === "string" &&
              anyUser.email.split("@")[0]?.trim()) ||
            "You"

          const displayName = derived || "You"

          // Persist to the same store used by ChatHeader/ChatScreen.
          await saveDisplayName(displayName)

          // Also update existing in-context identity names immediately.
          setHeaderNameState(displayName)
          await AsyncStorage.setItem(HEADER_NAME_KEY, displayName)
          if (!accountNameCustom) {
            setAccountNameState(displayName)
            await AsyncStorage.setItem(ACCOUNT_NAME_KEY, displayName)
          }

          console.log("[AUTH→IDENTITY NORMALIZED]", displayName)
        }
      },
      logout: async () => {
        setToken(null)
        setUser(null)
        setProfilePhotoState(null)
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
        await AsyncStorage.removeItem(AUTH_USER_KEY)
        await AsyncStorage.removeItem(PROFILE_PHOTO_KEY)
        await AsyncStorage.removeItem(HEADER_NAME_KEY)
        await AsyncStorage.removeItem(ACCOUNT_NAME_KEY)
        await AsyncStorage.removeItem(ACCOUNT_NAME_CUSTOM_KEY)
      },
    }),
    [
      token,
      user,
      isLoggedIn,
      isAuthenticated,
      userId,
      profilePhoto,
      headerName,
      accountName,
      accountNameCustom,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

