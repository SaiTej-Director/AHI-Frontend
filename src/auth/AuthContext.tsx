import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { saveDisplayName } from "../storage/userProfile"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { auth } from "../firebase/config"

type AuthUser = {
  id: string
  email: string
  googleId?: string | null
  displayName?: string | null
  photoURL?: string | null
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
  refreshAuthUserProfile: (
    displayName: string | null,
    photoURL: string | null
  ) => Promise<void>

  // Back-compat
  isLoggedIn: boolean
  authReady: boolean
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>
  signInWithGoogleIdToken: (idToken: string) => Promise<void>
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

function toAuthUser(firebaseUser: any): AuthUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    googleId:
      firebaseUser.providerData?.find((provider: any) => provider?.providerId === "google.com")
        ?.uid || null,
    displayName: firebaseUser.displayName || null,
    photoURL: firebaseUser.photoURL || null,
  }
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [headerName, setHeaderNameState] = useState("You")
  const [accountName, setAccountNameState] = useState("You")
  const [accountNameCustom, setAccountNameCustom] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  const isLoggedIn = Boolean(user)
  const isAuthenticated = isLoggedIn
  const userId = user?.id ?? null
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
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

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
        if (!firebaseUser) {
          setToken(null)
          setUser(null)
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
          await AsyncStorage.removeItem(AUTH_USER_KEY)
          setAuthReady(true)
          return
        }

        const nextToken = await firebaseUser.getIdToken()
        const nextUser = toAuthUser(firebaseUser)
        setToken(nextToken)
        setUser(nextUser)
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, nextToken)
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
        await saveDisplayName(nextUser.displayName?.trim() || "You")
        await valueRef.current.refreshAuthUserProfile(
          firebaseUser.displayName || null,
          firebaseUser.photoURL || null
        )
        setAuthReady(true)
      })
    })()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const valueRef = React.useRef<{
    refreshAuthUserProfile: (
      displayName: string | null,
      photoURL: string | null
    ) => Promise<void>
  }>({
    refreshAuthUserProfile: async () => {},
  })

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
      authReady,
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
      loginWithEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      },
      registerWithEmail: async (name, email, password) => {
        const created = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        )
        await updateProfile(created.user, {
          displayName: name.trim() || "You",
        })
        await created.user.reload()
        await valueRef.current.refreshAuthUserProfile(
          created.user.displayName || null,
          created.user.photoURL || null
        )
      },
      signInWithGoogleIdToken: async (idToken) => {
        const credential = GoogleAuthProvider.credential(idToken)
        await signInWithCredential(auth, credential)
      },
      refreshAuthUserProfile: async (displayName, photoURL) => {
        const safeName = displayName?.trim() || "You"

        setHeaderNameState(safeName)
        await AsyncStorage.setItem(HEADER_NAME_KEY, safeName)

        if (!accountNameCustom) {
          setAccountNameState(safeName)
          await AsyncStorage.setItem(ACCOUNT_NAME_KEY, safeName)
        }

        const nextPhoto = photoURL || ""
        setProfilePhotoState(nextPhoto || null)
        if (nextPhoto) {
          await AsyncStorage.setItem(PROFILE_PHOTO_KEY, nextPhoto)
        } else {
          await AsyncStorage.removeItem(PROFILE_PHOTO_KEY)
        }

        if (user) {
          const nextUser = {
            ...user,
            displayName: safeName,
            photoURL: photoURL || null,
          }
          setUser(nextUser)
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
        }
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
        await signOut(auth)
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
      authReady,
    ]
  )

  valueRef.current = {
    refreshAuthUserProfile: value.refreshAuthUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

