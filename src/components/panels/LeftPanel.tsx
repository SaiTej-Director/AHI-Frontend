// Left panel was still using legacy UI — rebuilding now.
// AHI UI V1 — Layout & Interaction Locked
import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
  Image,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../../auth/AuthContext"

/* Enable layout animation on Android */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type Props = {
  onPressAuth?: () => void
  isAuthenticated?: boolean
  accountName?: string | null
}

export default function LeftPanel({
  onPressAuth,
  isAuthenticated,
  accountName,
}: Props) {
  const [open, setOpen] = useState(false)
  const { profilePhoto, setProfilePhoto } = useAuth()

  function toggleConnect() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen(prev => !prev)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AUTH */}
        {isAuthenticated ? (
          <>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.accountRow}
              onPress={onPressAuth}
            >
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
                hitSlop={8}
              >
                {profilePhoto ? (
                  <Image
                    source={{ uri: profilePhoto }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
              </Pressable>

              <Text numberOfLines={1} style={styles.identityName}>
                {accountName || "You"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.authButton}
            onPress={onPressAuth}
          >
            <Text style={styles.authText}>SIGN UP / LOGIN</Text>
          </TouchableOpacity>
        )}

        {/* UNDERSTANDING LEVEL */}
        <View style={styles.understandingWrapper}>
          <View style={styles.understandingLabelRow}>
            <View style={styles.progressDot} />
            <Text style={styles.understandingTitle}>Understanding level</Text>
          </View>
          <Text style={styles.understandingValue}>Early stage</Text>
        </View>

        {/* PUSH CONNECT TOWARDS CENTER */}
        <View style={{ height: 160 }} />

        {/* CONNECT WITH */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleConnect}
          style={styles.connectButton}
        >
          <Text style={styles.connectText}>🔒 Connect with</Text>
        </TouchableOpacity>

        {/* LOCKED DROPDOWNS */}
        {open && (
          <View style={styles.dropdownWrapper}>
            <View style={styles.lockedItem}>
              <Text style={styles.lockedText}>CHAT</Text>
            </View>

            <View style={styles.lockedItem}>
              <Text style={styles.lockedText}>MEET</Text>
            </View>
          </View>
        )}

        {open && (
          <Text style={styles.primaryDescription}>
            Connect with like-minded people —
            same or opposite gender —
            once AHI understands you well enough.
          </Text>
        )}

        {open && <View style={{ height: 72 }} />}
      </ScrollView>

      {open && (
        <View style={styles.secondaryBlock}>
          <Text style={styles.secondaryText}>This stays private.</Text>
          <Text style={styles.secondaryText}>No public profiles.</Text>
          <Text style={styles.secondaryText}>No forced matches.</Text>
          <Text style={styles.secondaryText}>
            You decide when to engage.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          AHI adapts slowly, on purpose.
        </Text>
      </View>
    </View>
  )
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },

  content: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  authButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#1E1E1E",
    marginBottom: 28,
  },

  authText: {
    fontSize: 14,
    color: "#EAEAEA",
    letterSpacing: 0.6,
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "stretch",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#1E1E1E",
    marginBottom: 28,
  },

  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "transparent",
  },

  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "transparent",
  },

  identityName: {
    flex: 1,
    fontSize: 15,
    color: "#EAEAEA",
    letterSpacing: 0.2,
    fontWeight: "600",
  },

  understandingWrapper: {
    marginBottom: 8,
  },

  understandingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  understandingTitle: {
    fontSize: 13,
    color: "#9A9A9A",
  },

  progressDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#2E7D32",
    opacity: 0.7,
  },

  understandingValue: {
    fontSize: 13,
    color: "#D0D0D0",
    lineHeight: 18,
    flexWrap: "wrap",
  },

  connectButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: "#1E1E1E",
  },

  connectText: {
    fontSize: 15,
    color: "#EAEAEA",
  },

  dropdownWrapper: {
    marginTop: 8,
    marginLeft: 6,
  },

  lockedItem: {
    width: "70%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#181818",
    marginBottom: 8,
    opacity: 0.35,
  },

  lockedText: {
    fontSize: 13,
    color: "#AAAAAA",
    letterSpacing: 1,
  },

  primaryDescription: {
    marginTop: 16,
    fontSize: 14,
    color: "#BEBEBE",
    lineHeight: 20,
    maxWidth: 360,
  },

  secondaryBlock: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  secondaryText: {
    fontSize: 12,
    color: "#7F7F7F",
    lineHeight: 18,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  footerText: {
    fontSize: 12,
    color: "#6F6F6F",
  },
})
