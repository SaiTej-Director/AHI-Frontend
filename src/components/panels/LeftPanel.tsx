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
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useAuth } from "../../auth/AuthContext"

const panelButtonStyle = {
  height: 64,
  borderRadius: 16,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginBottom: 16,
}

type Props = {
  onPressAuth?: () => void
  onPressUnderstanding?: () => void
  onPressConnect?: () => void
  onPressProfile?: () => void
  accountName?: string | null
}

export default function LeftPanel({
  onPressAuth,
  onPressUnderstanding,
  onPressConnect,
  onPressProfile,
  accountName,
}: Props) {
  const { user, profilePhoto } = useAuth()

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE */}
        {user ? (
          <Pressable
            style={[styles.stackItem, styles.accountRow]}
            onPress={onPressProfile}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <Text numberOfLines={1} style={styles.identityName}>
              {accountName || "You"}
            </Text>
          </Pressable>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.stackItem, styles.authButton]}
            onPress={onPressAuth}
          >
            <Text style={styles.authText}>Login / Sign up</Text>
          </TouchableOpacity>
        )}

        {/* CONNECT WITH */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPressConnect}
          style={styles.stackItem}
        >
          <View style={styles.connectContent}>
            <View style={styles.connectIcon}>
              <View style={styles.connectHeadSecondary} />
              <View style={styles.connectHeadPrimary} />
            </View>
            <Text style={styles.connectText}>Connect With</Text>
          </View>
        </TouchableOpacity>

        {/* UNDERSTANDING LEVEL */}
        <Pressable
          onPress={onPressUnderstanding}
          style={({ pressed }) => [
            styles.stackItem,
            styles.understandingCard,
            pressed && styles.understandingCardPressed,
          ]}
        >
          <View style={styles.understandingLabelRow}>
            <MaterialCommunityIcons
              name="brain"
              size={14}
              color="#DCDCDC"
              style={styles.understandingIcon}
            />
            <Text numberOfLines={1} style={styles.understandingTitle}>
              Understanding Level
            </Text>
          </View>
        </Pressable>

        <View style={styles.placeholderBox} />
        <View style={styles.placeholderBox} />
        <View style={styles.placeholderBox} />
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
    ...panelButtonStyle,
    backgroundColor: "#1A1A1A",
    width: "100%",
  },
  understandingCard: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: "#1A1A1A",
  },

  understandingCardPressed: {
    transform: [{ scale: 0.96 }],
  },

  authButton: {
    justifyContent: "center",
  },

  authText: {
    fontSize: 15,
    color: "#EAEAEA",
    letterSpacing: 0.2,
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
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
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },

  understandingIcon: {
    opacity: 0.9,
  },

  understandingTitle: {
    fontSize: 15,
    color: "#ECECEC",
    fontWeight: "600",
    letterSpacing: 0.35,
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

  placeholderBox: {
    ...panelButtonStyle,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
})
