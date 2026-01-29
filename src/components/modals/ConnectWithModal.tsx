import React, { useMemo, useState } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native"

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

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <ConnectIcon />
            <Text style={styles.title}>Connect With</Text>
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
            style={[
              styles.tabButton,
              activeTab === "chat" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "chat" && styles.tabTextActive,
              ]}
            >
              CHAT
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("meet")}
            style={[
              styles.tabButton,
              activeTab === "meet" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "meet" && styles.tabTextActive,
              ]}
            >
              MEET
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.sectionTitle}>{tabData.title}</Text>

          <View style={styles.actionRow}>
            <Pressable
              disabled
              style={[styles.actionButton, styles.actionButtonDisabled]}
            >
              <Text style={styles.actionText}>{tabData.actionLabel}</Text>
            </Pressable>
            <Pressable onPress={tabData.onToggleInfo}>
              <Text style={styles.infoLink}>More info</Text>
            </Pressable>
          </View>

          {tabData.infoVisible ? (
            <Text style={styles.infoText}>{tabData.infoText}</Text>
          ) : null}

          <View style={styles.optionsList}>
            {tabData.options.map(option => (
              <View key={option.label} style={styles.optionRow}>
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
              </View>
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
    marginBottom: 12,
  },
  headerTitle: {
    flex: 1,
  },
  connectIcon: {
    width: 22,
    height: 14,
    marginBottom: 6,
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
  },
  subTitle: { color: "#cfcfcf", fontSize: 13 },
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
    gap: 10,
    marginBottom: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#1E1E1E",
  },
  tabButtonActive: {
    backgroundColor: "#2A2A2A",
  },
  tabText: {
    color: "#9a9a9a",
    fontSize: 12,
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#EAEAEA",
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#2A2A2A",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    color: "#D5D5D5",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  infoLink: {
    color: "#9fd0ff",
    fontSize: 13,
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
    opacity: 0.6,
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
