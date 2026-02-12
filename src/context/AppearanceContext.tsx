import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useColorScheme } from "react-native"

export type AppTheme = "Light" | "Dark" | "System"
export type ChatFontSize = "Small" | "Default" | "Large"

type AppearanceState = {
  appTheme: AppTheme
  resolvedTheme: "light" | "dark"
  chatFontSize: ChatFontSize
  appLanguage: string
  setAppTheme: (nextTheme: AppTheme) => Promise<void>
  setChatFontSize: (nextSize: ChatFontSize) => Promise<void>
  setAppLanguage: (nextLanguage: string) => Promise<void>
}

const APP_THEME_KEY = "appTheme"
const CHAT_FONT_SIZE_KEY = "chatFontSize"
const APP_LANGUAGE_KEY = "appLanguage"

const AppearanceContext = createContext<AppearanceState | null>(null)

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme()
  const [appTheme, setAppThemeState] = useState<AppTheme>("System")
  const [chatFontSize, setChatFontSizeState] = useState<ChatFontSize>("Default")
  const [appLanguage, setAppLanguageState] = useState("English")

  useEffect(() => {
    ;(async () => {
      const [savedTheme, savedFontSize, savedLanguage] = await Promise.all([
        AsyncStorage.getItem(APP_THEME_KEY),
        AsyncStorage.getItem(CHAT_FONT_SIZE_KEY),
        AsyncStorage.getItem(APP_LANGUAGE_KEY),
      ])

      if (savedTheme === "Light" || savedTheme === "Dark" || savedTheme === "System") {
        setAppThemeState(savedTheme)
      } else {
        await AsyncStorage.setItem(APP_THEME_KEY, "System")
      }
      if (savedFontSize === "Small" || savedFontSize === "Default" || savedFontSize === "Large") {
        setChatFontSizeState(savedFontSize)
      } else {
        await AsyncStorage.setItem(CHAT_FONT_SIZE_KEY, "Default")
      }
      if (savedLanguage?.trim()) {
        setAppLanguageState(savedLanguage)
      } else {
        await AsyncStorage.setItem(APP_LANGUAGE_KEY, "English")
      }
    })()
  }, [])

  const resolvedTheme: "light" | "dark" = useMemo(() => {
    if (appTheme === "System") {
      return systemTheme === "light" ? "light" : "dark"
    }
    return appTheme === "Light" ? "light" : "dark"
  }, [appTheme, systemTheme])

  const value = useMemo<AppearanceState>(
    () => ({
      appTheme,
      resolvedTheme,
      chatFontSize,
      appLanguage,
      setAppTheme: async (nextTheme) => {
        setAppThemeState(nextTheme)
        await AsyncStorage.setItem(APP_THEME_KEY, nextTheme)
      },
      setChatFontSize: async (nextSize) => {
        setChatFontSizeState(nextSize)
        await AsyncStorage.setItem(CHAT_FONT_SIZE_KEY, nextSize)
      },
      setAppLanguage: async (nextLanguage) => {
        setAppLanguageState(nextLanguage)
        await AsyncStorage.setItem(APP_LANGUAGE_KEY, nextLanguage)
      },
    }),
    [appTheme, resolvedTheme, chatFontSize, appLanguage]
  )

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error("useAppearance must be used within AppearanceProvider")
  return ctx
}

export function getChatFontScale(fontSize: ChatFontSize) {
  if (fontSize === "Small") return 0.9
  if (fontSize === "Large") return 1.1
  return 1
}
