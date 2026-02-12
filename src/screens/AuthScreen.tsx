import React, { useMemo, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import { useAuth } from "../auth/AuthContext"
import { GOOGLE_AUTH_CONFIG } from "../config/googleAuth"

WebBrowser.maybeCompleteAuthSession()

export default function AuthScreen() {
  const { loginWithEmail, registerWithEmail, signInWithGoogleIdToken } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const googleConfigured = useMemo(
    () => Boolean(GOOGLE_AUTH_CONFIG.webClientId),
    []
  )

  async function handleSubmit() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      if (mode === "login") {
        await loginWithEmail(email, password)
      } else {
        const trimmedName = name.trim()
        if (!trimmedName) throw new Error("Please enter your name")
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }
        await registerWithEmail(trimmedName, email, password)
      }
    } catch (e: any) {
      setError(e?.message || "AUTH_FAILED")
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardContent}
        >
          <Text style={styles.title}>Welcome</Text>

          <View style={styles.tabsRow}>
            <Pressable
              disabled={busy}
              onPress={() => setMode("login")}
              style={[styles.tabBtn, mode === "login" && styles.tabBtnActive]}
            >
              <Text
                style={[styles.tabText, mode === "login" && styles.tabTextActive]}
              >
                Login
              </Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={() => setMode("register")}
              style={[styles.tabBtn, mode === "register" && styles.tabBtnActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "register" && styles.tabTextActive,
                ]}
              >
                Register
              </Text>
            </Pressable>
          </View>

          {mode === "register" ? (
            <TextInput
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Name"
              placeholderTextColor="#777"
              editable={!busy}
              style={styles.input}
            />
          ) : null}

          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#777"
            editable={!busy}
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#777"
            editable={!busy}
            style={styles.input}
          />
          {mode === "register" ? (
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm password"
              placeholderTextColor="#777"
              editable={!busy}
              style={styles.input}
            />
          ) : null}

          <Pressable
            disabled={busy}
            onPress={handleSubmit}
            style={[styles.secondaryBtn, { opacity: busy ? 0.6 : 1 }]}
          >
            <Text style={styles.secondaryText}>
              {mode === "login" ? "Login" : "Register"}
            </Text>
          </Pressable>

          {googleConfigured ? (
            <GoogleLoginButton
              disabled={busy}
              onError={(msg) => setError(msg)}
              onSuccess={async (idToken) => {
                if (busy) return
                setBusy(true)
                setError(null)
                try {
                  await signInWithGoogleIdToken(idToken)
                } catch (e: any) {
                  setError(e?.message || "AUTH_FAILED")
                } finally {
                  setBusy(false)
                }
              }}
            />
          ) : null}

          {busy && (
            <View style={{ marginTop: 12 }}>
              <ActivityIndicator />
            </View>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </View>
    </View>
  )
}

function GoogleLoginButton({
  disabled,
  onSuccess,
  onError,
}: {
  disabled: boolean
  onSuccess: (idToken: string) => void
  onError: (msg: string) => void
}) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_AUTH_CONFIG.webClientId,
  })

  React.useEffect(() => {
    if (response?.type !== "success") return
    const idToken =
      (response as any)?.authentication?.idToken ||
      (response as any)?.params?.id_token
    if (!idToken) {
      onError("Missing idToken")
      return
    }
    onSuccess(String(idToken))
  }, [response, onSuccess, onError])

  return (
    <Pressable
      disabled={disabled || !request}
      onPress={() => {
        if (!GOOGLE_AUTH_CONFIG.webClientId) {
          onError("Google not configured")
          return
        }
        promptAsync()
      }}
      style={[styles.primaryBtn, { opacity: disabled ? 0.6 : 1 }]}
    >
      <Text style={styles.primaryText}>Continue with Google</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#242424",
    maxHeight: "78%",
  },
  cardContent: {
    paddingBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#121212",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 4,
    marginBottom: 12,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: "#2B2B2B",
  },
  tabText: {
    color: "#AFAFAF",
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    marginBottom: 10,
    backgroundColor: "#121212",
  },
  primaryBtn: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginTop: 10,
  },
  primaryText: { color: "#EAEAEA", fontSize: 14, fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: "#2B2B2B",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 2,
  },
  secondaryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  error: { marginTop: 10, color: "#ff8a8a", fontSize: 12 },
})
