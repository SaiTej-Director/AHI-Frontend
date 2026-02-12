import React, { useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native"

type TabKey = "chat" | "meet"

type Props = {
  visible: boolean
  onClose: () => void
  initialTab?: TabKey
}

export default function ConnectWithModal({
  visible,
  onClose,
  initialTab = "chat",
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  const [showChatInfo, setShowChatInfo] = useState(false)
  const [showMeetInfo, setShowMeetInfo] = useState(false)

  const tabData = useMemo(() => {
    return activeTab === "chat"
      ? {
          title: "Chat with someone similar to you",
          actionLabel: "CHAT",
          infoVisible: showChatInfo,
          onToggleInfo: () => setShowChatInfo(prev => !prev),
          options: [
            {
              label: "Same Gender",
              description: "For comfort and familiarity.",
            },
            {
              label: "Opposite Gender",
              description: "For perspective and difference.",
            },
          ],
          infoText:
            "Conversations focus on mindset and tone. Profiles stay minimal and private.",
        }
      : {
          title: "Meet in the real world",
          actionLabel: "MEET",
          infoVisible: showMeetInfo,
          onToggleInfo: () => setShowMeetInfo(prev => !prev),
          options: [
            {
              label: "Same Gender",
              description: "Low-risk, clarity-first meetings.",
            },
            {
              label: "Opposite Gender",
              description: "Not dating. Not random. Intent-aligned only.",
            },
          ],
          infoText:
            "Meetups are intentional and opt-in, designed for safety and clarity.",
        }
  }, [activeTab, showChatInfo, showMeetInfo])

  const handleLockedOptionPress = () => {
    Alert.alert(
      "Coming Soon",
      "This matching option will be available in a future update.",
      [{ text: "OK" }],
    )
  }

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <View style={styles.headerTitleRow}>
              <ConnectIcon />
              <Text style={styles.title}>Connect With</Text>
            </View>
            <Text style={styles.subTitle}>
              Connections based on mindset, not profiles.
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setActiveTab("chat")}
            style={({ pressed }) => [
              styles.controlButton,
              styles.primaryControl,
              activeTab === "chat" && styles.controlButtonActive,
              pressed && styles.controlPressed,
            ]}
          >
            <Text
              style={[
                styles.controlText,
                activeTab === "chat" && styles.controlTextActive,
              ]}
            >
              CHAT
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("meet")}
            style={({ pressed }) => [
              styles.controlButton,
              styles.primaryControl,
              activeTab === "meet" && styles.controlButtonActive,
              pressed && styles.controlPressed,
            ]}
          >
            <Text
              style={[
                styles.controlText,
                activeTab === "meet" && styles.controlTextActive,
              ]}
            >
              MEET
            </Text>
          </Pressable>
          <Pressable
            onPress={tabData.onToggleInfo}
            accessibilityRole="button"
            accessibilityLabel="More info"
            style={({ pressed }) => [
              styles.controlButton,
              styles.infoControl,
              pressed && styles.controlPressed,
            ]}
          >
            <Text style={styles.infoControlText}>i</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.sectionTitle}>{tabData.title}</Text>

          {tabData.infoVisible ? (
            <Text style={styles.infoText}>{tabData.infoText}</Text>
          ) : null}

          <View style={styles.optionsList}>
            {tabData.options.map(option => (
              <Pressable
                key={option.label}
                onPress={handleLockedOptionPress}
                accessibilityRole="button"
                accessibilityLabel={`${option.label} locked option`}
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.optionRowPressed,
                ]}
              >
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <View style={styles.lockIcon}>
                  <View style={styles.lockShackle} />
                  <View style={styles.lockBody} />
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

function ConnectIcon() {
  return (
    <View style={styles.connectIcon}>
      <View style={styles.connectHeadSecondary} />
      <View style={styles.connectHeadPrimary} />
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
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
    zIndex: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 28,
  },
  headerTitle: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  connectIcon: {
    width: 20,
    height: 12,
    flexShrink: 0,
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
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flexShrink: 1,
  },
  subTitle: {
    color: "rgba(232, 232, 232, 0.65)",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
  },
  closeText: { color: "#e5e5e5", fontSize: 18, lineHeight: 18 },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  controlButton: {
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primaryControl: {
    flex: 1,
    minWidth: 84,
    paddingHorizontal: 16,
  },
  infoControl: {
    width: 40,
    borderRadius: 20,
    backgroundColor: "#242424",
    borderColor: "#343434",
  },
  controlButtonActive: {
    backgroundColor: "#2A2A2A",
    borderColor: "#3A3A3A",
  },
  controlPressed: {
    transform: [{ scale: 0.96 }],
  },
  controlText: {
    color: "#9a9a9a",
    fontSize: 12,
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  controlTextActive: {
    color: "#EAEAEA",
  },
  infoControlText: {
    color: "#CFCFCF",
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "500",
    marginTop: -1,
  },
  content: {
    paddingBottom: 16,
  },
  sectionTitle: {
    color: "#EAEAEA",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoText: {
    color: "#BEBEBE",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  optionsList: {
    gap: 10,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    paddingVertical: 10,
    paddingHorizontal: 12,
    opacity: 0.85,
  },
  optionRowPressed: {
    transform: [{ scale: 0.96 }],
  },
  optionText: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    color: "#E0E0E0",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    color: "#A6A6A6",
    fontSize: 12,
    lineHeight: 16,
  },
  lockIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  lockShackle: {
    width: 10,
    height: 7,
    borderWidth: 1,
    borderColor: "#6E6E6E",
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  lockBody: {
    width: 12,
    height: 9,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#6E6E6E",
    marginTop: -1,
  },
})
