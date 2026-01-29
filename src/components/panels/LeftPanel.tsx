import React from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Image,
} from "react-native"
import { useAuth } from "../../auth/AuthContext"

type Props = {
  onPressAuth?: () => void
  onPressUnderstanding?: () => void
  onPressConnect?: () => void
  isAuthenticated?: boolean
  accountName?: string | null
}

export default function LeftPanel({
  onPressAuth,
  onPressUnderstanding,
  onPressConnect,
  isAuthenticated,
  accountName,
}: Props) {
  const { profilePhoto } = useAuth()
  const understandingStage = "Early Understanding"

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE */}
        {isAuthenticated ? (
          <View style={[styles.stackItem, styles.accountRow]}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <Text numberOfLines={1} style={styles.identityName}>
              {accountName || "You"}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.stackItem, styles.authButton]}
            onPress={onPressAuth}
          >
            <Text style={styles.authText}>Login / Sign up</Text>
          </TouchableOpacity>
        )}

        {/* UNDERSTANDING LEVEL */}
        <Pressable onPress={onPressUnderstanding} style={styles.stackItem}>
          <View style={styles.understandingLabelRow}>
            <View style={styles.progressDot} />
            <Text style={styles.understandingTitle}>Understanding Level</Text>
          </View>
          <Text style={styles.understandingValue}>{understandingStage}</Text>
        </Pressable>

        {/* CONNECT WITH */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPressConnect}
          style={[styles.stackItem, styles.stackItemLast]}
        >
          <View style={styles.connectContent}>
            <View style={styles.connectIcon}>
              <View style={styles.connectHeadSecondary} />
              <View style={styles.connectHeadPrimary} />
            </View>
            <Text style={styles.connectText}>Connect With</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 28,
    flexGrow: 1,
  },

  stackItem: {
    alignSelf: "stretch",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    minHeight: 64,
    justifyContent: "center",
    marginBottom: 12,
  },

  stackItemLast: {
    marginBottom: 0,
  },

  authButton: {
    alignItems: "flex-start",
  },

  authText: {
    fontSize: 14,
    color: "#EAEAEA",
    letterSpacing: 0.2,
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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

  understandingLabelRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },

  progressDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#2E7D32",
    opacity: 0.7,
    marginTop: 4,
  },

  understandingTitle: {
    fontSize: 13,
    color: "#9A9A9A",
  },

  understandingValue: {
    fontSize: 13,
    color: "#D0D0D0",
    paddingLeft: 17,
    lineHeight: 18,
  },

  connectContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  connectIcon: {
    width: 22,
    height: 14,
  },

  connectHeadPrimary: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A9A9A9",
  },

  connectHeadSecondary: {
    position: "absolute",
    left: 0,
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#7F7F7F",
  },

  connectText: {
    fontSize: 15,
    color: "#EAEAEA",
  },
})
