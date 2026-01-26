// AHI UI V1 — Layout & Interaction Locked
import React, { useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native"
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import * as ImagePicker from "expo-image-picker"
import { apiPost } from "../../utils/api"
import { useAuth } from "../../auth/AuthContext"
import { GOOGLE_AUTH_CONFIG } from "../../config/googleAuth"

WebBrowser.maybeCompleteAuthSession()

type Props = {
  visible: boolean
  onClose: () => void
  contextMessage?: string | null
}

export default function AuthModal({ visible, onClose, contextMessage }: Props) {
  const { setAuth, logout, isAuthenticated, accountName, profilePhoto, setProfilePhoto, removeProfilePhoto } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const googleConfigured = useMemo(() => {
    return Boolean(GOOGLE_AUTH_CONFIG.webClientId)
  }, [])

  async function handleEmailAuth() {
    setBusy(true)
    setError(null)
    try {
      const path = mode === "register" ? "/auth/register" : "/auth/login"
      const data = await apiPost<{ token: string; user: any }>(path, {
        email,
        password,
      })
      if (!data?.token || !data?.user) {
        throw new Error("AUTH_FAILED")
      }
      await setAuth(data.token, data.user)
      onClose()
    } catch (e: any) {
      setError(e?.message || "AUTH_FAILED")
    } finally {
      setBusy(false)
    }
  }

  if (!visible) return null

  if (isAuthenticated) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardContent}
          >
            <Text style={styles.title}>{accountName}</Text>

            <View style={{ height: 12 }} />

            <Pressable
              onPress={async () => {
                const perm =
                  await ImagePicker.requestMediaLibraryPermissionsAsync()
                if (!perm.granted) return

                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 0.9,
                  allowsEditing: false,
                })

                if ((result as any).canceled) return
                const uri = (result as any)?.assets?.[0]?.uri
                if (uri) {
                  await setProfilePhoto(uri)
                }
              }}
              style={styles.photoRow}
            >
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.photoCircle} />
              ) : (
                <View style={styles.photoCirclePlaceholder} />
              )}
              <Text style={styles.photoText}>
                {profilePhoto ? "Change photo" : "Add photo"}
              </Text>
            </Pressable>

            {profilePhoto ? (
              <Pressable
                disabled={busy}
                onPress={async () => {
                  setBusy(true)
                  try {
                    await removeProfilePhoto()
                  } finally {
                    setBusy(false)
                  }
                }}
                style={[styles.linkBtn, { paddingVertical: 6 }]}
              >
                <Text style={styles.linkText}>Remove photo</Text>
              </Pressable>
            ) : null}

            <View style={{ height: 14 }} />

            <Pressable
              disabled={busy}
              onPress={async () => {
                setBusy(true)
                try {
                  await logout()
                  onClose()
                } finally {
                  setBusy(false)
                }
              }}
              style={[styles.secondaryBtn, { opacity: busy ? 0.6 : 1 }]}
            >
              <Text style={styles.secondaryText}>Logout</Text>
            </Pressable>

            {busy && (
              <View style={{ marginTop: 12 }}>
                <ActivityIndicator />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    )
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardContent}
        >
          <Text style={styles.title}>Sign in</Text>
          {contextMessage ? (
            <Text style={styles.subTitle}>{contextMessage}</Text>
          ) : null}

          {googleConfigured ? (
            <GoogleLoginButton
              disabled={busy}
              onError={(msg) => setError(msg)}
              onSuccess={async (idToken) => {
                setBusy(true)
                setError(null)
                try {
                  const data = await apiPost<{ token: string; user: any }>(
                    "/auth/google",
                    { idToken }
                  )
                  if (!data?.token || !data?.user) throw new Error("AUTH_FAILED")
                  await setAuth(data.token, data.user)
                  onClose()
                } catch (e: any) {
                  setError(e?.message || "AUTH_FAILED")
                } finally {
                  setBusy(false)
                }
              }}
            />
          ) : (
            <Pressable
              disabled={busy}
              onPress={() => {
                // Critical: do NOT mount the Google hook if not configured (it throws on Android).
                setError("Google not configured")
              }}
              style={[styles.primaryBtn, { opacity: busy ? 0.6 : 1 }]}
            >
              <Text style={styles.primaryText}>Continue with Google</Text>
            </Pressable>
          )}

          <View style={{ height: 14 }} />
          <Text style={styles.subTitle}>
            {mode === "login" ? "Login with email" : "Create account"}
          </Text>

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

          <Pressable
            disabled={busy}
            onPress={handleEmailAuth}
            style={[styles.secondaryBtn, { opacity: busy ? 0.6 : 1 }]}
          >
            <Text style={styles.secondaryText}>
              {mode === "login" ? "Login" : "Register"}
            </Text>
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={() => setMode(mode === "login" ? "register" : "login")}
            style={styles.linkBtn}
          >
            <Text style={styles.linkText}>
              {mode === "login"
                ? "No account? Register"
                : "Have an account? Login"}
            </Text>
          </Pressable>

          {busy && (
            <View style={{ marginTop: 12 }}>
              <ActivityIndicator />
            </View>
          )}
          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.note}>
            {Platform.OS === "android"
              ? "Tip: On Android emulator, backend must be reachable at 10.0.2.2"
              : ""}
          </Text>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "8%",
    height: "72%",
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#242424",
  },
  cardContent: {
    paddingBottom: 16,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 12 },
  subTitle: { color: "#cfcfcf", fontSize: 13, marginBottom: 8 },
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
  linkBtn: { paddingVertical: 10, alignItems: "center" },
  linkText: { color: "#9fd0ff", fontSize: 13 },
  error: { marginTop: 10, color: "#ff8a8a", fontSize: 12 },
  note: { marginTop: 8, color: "#6f6f6f", fontSize: 11 },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  photoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  photoCirclePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "transparent",
  },
  photoText: { color: "#EAEAEA", fontSize: 13, fontWeight: "600" },
})

