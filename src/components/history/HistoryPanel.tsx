// AHI UI V1 — Layout & Interaction Locked
import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Linking,
  Platform,
  Share,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import Constants from "expo-constants"
import {
  Conversation,
  getEarlierSessions,
  getTodaySessions,
  getYesterdaySessions,
  loadHistory,
  deleteConversation,
  deleteByPredicate,
} from "../../storage/history"
import { useAppearance } from "../../context/AppearanceContext"
import { useAuth } from "../../auth/AuthContext"
import { deleteUser } from "firebase/auth"
import { auth } from "../../firebase/config"

type Props = {
  visible: boolean
  onClose: () => void
  onOpen?: (conversation: Conversation) => void
}

type ThemeOption = "Light" | "Dark" | "System"
type FontSizeOption = "Small" | "Default" | "Large"
type ResponseLengthOption = "Short" | "Balanced" | "Detailed"
type HumorLevelOption = "Low" | "Normal" | "Playful"

const panelButtonStyle = {
  height: 64,
  borderRadius: 16,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginBottom: 16,
}

export default function HistoryPanel({ visible, onClose, onOpen }: Props) {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()
  const {
    appTheme,
    setAppTheme,
    appLanguage,
    setAppLanguage,
    chatFontSize,
    setChatFontSize,
    resolvedTheme,
  } = useAppearance()
  const cardBackground = resolvedTheme === "light" ? "#FFFFFF" : "#151515"
  const modalBackground = resolvedTheme === "light" ? "#F2F2F2" : "#181818"
  const modalBorder = resolvedTheme === "light" ? "#DDDDDD" : "#242424"
  const headingText = resolvedTheme === "light" ? "#5E5E5E" : "#b8b8b8"
  const bodyText = resolvedTheme === "light" ? "#343434" : "#cdcdcd"
  const sectionTitle = resolvedTheme === "light" ? "#101010" : "#ffffff"

  const [historyVisible, setHistoryVisible] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const keepModalOnCloseRef = useRef(false)
  const [todayOpen, setTodayOpen] = useState(false)
  const [pastOpen, setPastOpen] = useState(false)
  const [todaySessions, setTodaySessions] = useState<Conversation[]>([])
  const [yesterdaySessions, setYesterdaySessions] = useState<Conversation[]>(
    []
  )
  const [earlierSessions, setEarlierSessions] = useState<Conversation[]>([])
  const [selectedSession, setSelectedSession] =
    useState<Conversation | null>(null)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [responseLength, setResponseLength] =
    useState<ResponseLengthOption>("Balanced")
  const [humorLevel, setHumorLevel] = useState<HumorLevelOption>("Normal")
  const [emojiUsageOn, setEmojiUsageOn] = useState(true)
  const [memoryModeOn, setMemoryModeOn] = useState(true)

  async function refreshSessions() {
    const conversations = await loadHistory()
    setTodaySessions(getTodaySessions(conversations))
    setYesterdaySessions(getYesterdaySessions(conversations))
    setEarlierSessions(getEarlierSessions(conversations))
  }

  function openSession(conversation: Conversation) {
    onOpen?.(conversation)
    setSelectedSession(conversation)
  }

  function buildMergedConversation(
    sessions: Conversation[],
    id: string
  ): Conversation | null {
    if (sessions.length === 0) return null

    const messages = [...sessions]
      .flatMap(session => session.messages)
      .sort((a, b) => a.timestamp - b.timestamp)

    const startedAt = Math.min(...sessions.map(s => s.startedAt))
    const lastUpdatedAt = Math.max(...sessions.map(s => s.lastUpdatedAt))

    return {
      id,
      messages,
      startedAt,
      lastUpdatedAt,
    }
  }

  useEffect(() => {
    if (!visible) {
      if (!keepModalOnCloseRef.current) {
        setHistoryVisible(false)
        setSettingsVisible(false)
        setSelectedSession(null)
        setLanguageOpen(false)
      }
    }
  }, [visible])

  useEffect(() => {
    if (!historyVisible) {
      setSelectedSession(null)
      return
    }
    refreshSessions()
  }, [historyVisible])

  useEffect(() => {
    if (!historyVisible && !settingsVisible) {
      keepModalOnCloseRef.current = false
    }
  }, [historyVisible, settingsVisible])

  function confirmDelete(sessionId: string) {
    Alert.alert(
      "Delete session?",
      "This conversation will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteConversation(sessionId)
            if (selectedSession?.id === sessionId) {
              setSelectedSession(null)
            }
            refreshSessions()
          },
        },
      ]
    )
  }

  function confirmDeleteMerged(
    sessions: Conversation[],
    mergedId: string
  ) {
    Alert.alert(
      "Delete session?",
      "This conversation will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteByPredicate(c =>
              sessions.some(session => session.id === c.id)
            )
            if (selectedSession?.id === mergedId) {
              setSelectedSession(null)
            }
            refreshSessions()
          },
        },
      ]
    )
  }

  function formatTime(timestamp: number) {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
      return ""
    }
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const suffix = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 === 0 ? 12 : hours % 12
    return `${hour12}:${minutes} ${suffix}`
  }

  function handleOpenPrivacy() {
    setSettingsVisible(false)
    navigation.navigate("PrivacyPolicy")
  }

  function handleOpenTerms() {
    setSettingsVisible(false)
    navigation.navigate("Terms")
  }

  function handleSetTheme(nextTheme: ThemeOption) {
    setAppTheme(nextTheme).catch(() => {
      Alert.alert("Unable to save theme", "Please try again.")
    })
  }

  function handleSetFontSize(nextFontSize: FontSizeOption) {
    setChatFontSize(nextFontSize).catch(() => {
      Alert.alert("Unable to save font size", "Please try again.")
    })
  }

  function handleSetLanguage(nextLanguage: string) {
    setAppLanguage(nextLanguage)
      .then(() => setLanguageOpen(false))
      .catch(() => {
        Alert.alert("Unable to save language", "Please try again.")
      })
  }

  function handleLogout() {
    logout().catch(() => {
      Alert.alert("Logout failed", "Please try again.")
    })
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const firebaseUser = auth.currentUser
              if (!firebaseUser) {
                await logout()
                return
              }
              await deleteUser(firebaseUser)
              await logout()
              Alert.alert("Account deleted", "You are now in guest mode.")
            } catch (error: any) {
              if (error?.code === "auth/requires-recent-login") {
                Alert.alert(
                  "Re-authentication required",
                  "Please sign in again and retry account deletion."
                )
                return
              }
              Alert.alert("Delete failed", "Unable to delete account right now.")
            }
          },
        },
      ]
    )
  }

  async function handleSendFeedback() {
    const emailUrl = "mailto:support@ahiapp.com"
    const canOpen = await Linking.canOpenURL(emailUrl)
    if (!canOpen) {
      Alert.alert("Cannot open email app", "Please email support@ahiapp.com")
      return
    }
    await Linking.openURL(emailUrl)
  }

  async function handleRateApp() {
    const url =
      Platform.OS === "android"
        ? "https://play.google.com/store/apps/details?id=com.ahiapp.placeholder"
        : "https://ahiapp.com/rate"
    const canOpen = await Linking.canOpenURL(url)
    if (!canOpen) {
      Alert.alert("Cannot open link", url)
      return
    }
    await Linking.openURL(url)
  }

  async function handleOpenAppPermissions() {
    try {
      await Linking.openSettings()
    } catch {
      Alert.alert("Unavailable", "Unable to open app settings on this device.")
    }
  }

  async function handleExportChat() {
    const conversations = await loadHistory()
    if (conversations.length === 0) {
      Alert.alert("No chat history", "Start a conversation to export chat data.")
      return
    }
    await Share.share({
      message: JSON.stringify(conversations, null, 2),
      title: "AHI Chat Export",
    })
  }

  function handleCloseOverlay() {
    keepModalOnCloseRef.current = false
    setHistoryVisible(false)
    setSettingsVisible(false)
    onClose()
  }

  return (
    <>
      {visible && (
        <>
          {/* Dimmed backdrop */}
          <Pressable style={styles.backdrop} onPress={onClose} />

          {/* Panel */}
          <View style={styles.panel}>
            <View style={styles.panelContent}>
              <Pressable
                style={styles.panelButton}
                onPress={() => {
                  keepModalOnCloseRef.current = true
                  setHistoryVisible(true)
                  onClose()
                }}
              >
                <Text style={styles.panelButtonText}>History</Text>
              </Pressable>

              <Pressable
                style={styles.panelButton}
                onPress={() => {
                  keepModalOnCloseRef.current = true
                  setSettingsVisible(true)
                  onClose()
                }}
              >
                <Text style={styles.panelButtonText}>Settings</Text>
              </Pressable>

              <View style={styles.panelPlaceholder} />
              <View style={styles.panelPlaceholder} />
              <View style={styles.panelPlaceholder} />
            </View>
          </View>
        </>
      )}

      {/* History modal */}
      {historyVisible && (
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseOverlay} />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: modalBackground,
                borderColor: modalBorder,
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            {selectedSession ? (
              <View style={styles.modalHeaderRow}>
                <View style={styles.headerLeftGroup}>
                  <Pressable
                    onPress={() => setSelectedSession(null)}
                    style={styles.backButton}
                    hitSlop={8}
                  >
                    <Text style={styles.backText}>←</Text>
                  </Pressable>
                  <Text
                    style={[
                      styles.title,
                      styles.modalHeaderTitle,
                      { color: sectionTitle },
                    ]}
                  >
                    History
                  </Text>
                </View>
                <Pressable
                  onPress={handleCloseOverlay}
                  hitSlop={8}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.modalHeaderRow}>
                <Text
                  style={[
                    styles.title,
                    styles.modalHeaderTitle,
                    { color: sectionTitle },
                  ]}
                >
                  History
                </Text>
                <Pressable
                  onPress={handleCloseOverlay}
                  hitSlop={8}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>
            )}

            {selectedSession ? (
              <ScrollView
                style={styles.viewer}
                contentContainerStyle={styles.viewerContent}
                showsVerticalScrollIndicator={false}
              >
                {selectedSession.messages.map((msg, index) => {
                  const messageKey = msg?.id || `msg-${index}`
                  return (
                    <View key={`${messageKey}-${index}`} style={styles.messageRow}>
                      <Text style={styles.messageMeta}>
                        {formatTime(msg.timestamp)} •{" "}
                        {msg.sender === "user" ? "You" : "ahi"}
                      </Text>
                      <Text style={styles.messageText}>{msg.text}</Text>
                    </View>
                  )
                })}
              </ScrollView>
            ) : (
              <ScrollView
                style={styles.viewer}
                contentContainerStyle={styles.historyContent}
                showsVerticalScrollIndicator={false}
              >
                <>
                  <Pressable
                    onPress={() => setTodayOpen(v => !v)}
                    style={styles.sectionHeader}
                  >
                    <Text style={styles.sectionText}>
                      Today {todayOpen ? "▾" : "▸"}
                    </Text>
                  </Pressable>

                  {todayOpen && (
                    <View style={styles.sessionList}>
                      {todaySessions.map(session => {
                        const timestamp = session.lastUpdatedAt || session.startedAt

                        const timeLabel =
                          timestamp && !isNaN(new Date(timestamp).getTime())
                            ? new Date(timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""

                        if (!timeLabel) {
                          return null
                        }

                        return (
                          <Pressable
                            key={session.id}
                            style={styles.sessionRow}
                            onPress={() => openSession(session)}
                            onLongPress={() => confirmDelete(session.id)}
                          >
                            <Text style={styles.sessionTime}>{timeLabel}</Text>
                          </Pressable>
                        )
                      })}
                    </View>
                  )}

                  <Pressable
                    onPress={() => setPastOpen(v => !v)}
                    style={[styles.sectionHeader, { marginTop: 12 }]}
                  >
                    <Text style={styles.sectionText}>
                      Past {pastOpen ? "▾" : "▸"}
                    </Text>
                  </Pressable>

                  {pastOpen && (
                    <View style={styles.pastWrapper}>
                      <Pressable
                        style={styles.pillButton}
                        onPress={() => {
                          const merged = buildMergedConversation(
                            yesterdaySessions,
                            "yesterday-merged"
                          )
                          if (merged) openSession(merged)
                        }}
                        onLongPress={() =>
                          confirmDeleteMerged(yesterdaySessions, "yesterday-merged")
                        }
                      >
                        <Text style={styles.pillText}>
                          Yesterday ({yesterdaySessions.length})
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[styles.pillButton, { marginTop: 8 }]}
                        onPress={() => {
                          const merged = buildMergedConversation(
                            earlierSessions,
                            "earlier-merged"
                          )
                          if (merged) openSession(merged)
                        }}
                        onLongPress={() =>
                          confirmDeleteMerged(earlierSessions, "earlier-merged")
                        }
                      >
                        <Text style={styles.pillText}>
                          Earlier ({earlierSessions.length})
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </>
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* Settings modal */}
      {settingsVisible && (
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseOverlay} />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: modalBackground,
                borderColor: modalBorder,
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <Text
                style={[
                  styles.title,
                  styles.modalHeaderTitle,
                  { color: sectionTitle },
                ]}
              >
                Settings
              </Text>
              <Pressable
                onPress={handleCloseOverlay}
                hitSlop={8}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.viewer}
              contentContainerStyle={styles.settingsContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.settingsSectionHeader, { color: headingText }]}>
                Account
              </Text>
              <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
                <View style={styles.profileRow}>
                  <Text style={styles.profileName}>{user?.displayName || "Guest User"}</Text>
                  <Text style={styles.profileEmail}>{user?.email || "Not logged in"}</Text>
                </View>
                <Pressable style={styles.settingsButton} onPress={handleLogout}>
                  <Text style={styles.settingsButtonText}>Logout</Text>
                </Pressable>
                <Pressable
                  style={[styles.settingsButton, styles.destructiveButton]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.destructiveText}>Delete Account</Text>
                </Pressable>
              </View>

              <Text style={[styles.settingsSectionHeader, { color: headingText }]}>
                Chat Preferences
              </Text>
              <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
                <View style={styles.settingsRow}>
                  <Text style={[styles.settingsLabel, { color: bodyText }]}>Theme</Text>
                  <View style={styles.segmentedRow}>
                    {(["Light", "Dark", "System"] as ThemeOption[]).map(
                      option => (
                        <Pressable
                          key={option}
                          style={[
                            styles.segmentButton,
                            appTheme === option && styles.segmentButtonActive,
                          ]}
                          onPress={() => handleSetTheme(option)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              appTheme === option && styles.segmentTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </View>
                </View>

                <View style={styles.settingsRow}>
                  <Text style={[styles.settingsLabel, { color: bodyText }]}>Language</Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => setLanguageOpen(v => !v)}
                  >
                    <Text style={styles.dropdownText}>
                      {appLanguage} {languageOpen ? "▴" : "▾"}
                    </Text>
                  </Pressable>
                  {languageOpen && (
                    <View style={styles.dropdownList}>
                      {["English", "Spanish", "French", "Hindi"].map(option => (
                        <Pressable
                          key={option}
                          style={styles.dropdownItem}
                          onPress={() => handleSetLanguage(option)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              appLanguage === option && styles.segmentTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.settingsRow}>
                  <Text style={[styles.settingsLabel, { color: bodyText }]}>Font Size</Text>
                  <View style={styles.segmentedRow}>
                    {(["Small", "Default", "Large"] as FontSizeOption[]).map(
                      option => (
                        <Pressable
                          key={option}
                          style={[
                            styles.segmentButton,
                            chatFontSize === option && styles.segmentButtonActive,
                          ]}
                          onPress={() => handleSetFontSize(option)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              chatFontSize === option && styles.segmentTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </View>
                </View>
              </View>

              <Text style={[styles.settingsSectionHeader, { color: headingText }]}>
                AHI Behavior
              </Text>
              <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Response Length</Text>
                  <View style={styles.segmentedRow}>
                    {(
                      ["Short", "Balanced", "Detailed"] as ResponseLengthOption[]
                    ).map(option => (
                      <Pressable
                        key={option}
                        style={[
                          styles.segmentButton,
                          responseLength === option && styles.segmentButtonActive,
                        ]}
                        onPress={() => setResponseLength(option)}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            responseLength === option &&
                              styles.segmentTextActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Humor Level</Text>
                  <View style={styles.segmentedRow}>
                    {(["Low", "Normal", "Playful"] as HumorLevelOption[]).map(
                      option => (
                        <Pressable
                          key={option}
                          style={[
                            styles.segmentButton,
                            humorLevel === option && styles.segmentButtonActive,
                          ]}
                          onPress={() => setHumorLevel(option)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              humorLevel === option && styles.segmentTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </View>
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Emoji Usage</Text>
                  <View style={styles.segmentedRow}>
                    {(["On", "Minimal"] as const).map(option => (
                      <Pressable
                        key={option}
                        style={[
                          styles.segmentButton,
                          (emojiUsageOn ? "On" : "Minimal") === option &&
                            styles.segmentButtonActive,
                        ]}
                        onPress={() => setEmojiUsageOn(option === "On")}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            (emojiUsageOn ? "On" : "Minimal") === option &&
                              styles.segmentTextActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Memory Mode</Text>
                  <View style={styles.segmentedRow}>
                    {(["On", "Off"] as const).map(option => (
                      <Pressable
                        key={option}
                        style={[
                          styles.segmentButton,
                          (memoryModeOn ? "On" : "Off") === option &&
                            styles.segmentButtonActive,
                        ]}
                        onPress={() => setMemoryModeOn(option === "On")}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            (memoryModeOn ? "On" : "Off") === option &&
                              styles.segmentTextActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={[styles.settingsSectionHeader, { color: headingText }]}>
                Privacy & Data
              </Text>
              <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
                <Pressable style={styles.settingsButton} onPress={handleOpenPrivacy}>
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Pressable>
                <Pressable style={styles.settingsButton} onPress={handleOpenTerms}>
                  <Text style={styles.linkText}>Terms of Service</Text>
                </Pressable>
                <Pressable style={styles.settingsButton} onPress={handleOpenAppPermissions}>
                  <Text style={styles.settingsButtonText}>App Permissions</Text>
                </Pressable>
                <Pressable style={styles.settingsButton} onPress={handleExportChat}>
                  <Text style={styles.settingsButtonText}>Export Chat</Text>
                </Pressable>
              </View>

              <Text style={[styles.settingsSectionHeader, { color: headingText }]}>
                About
              </Text>
              <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
                <View style={styles.versionRow}>
                  <Text style={styles.settingsLabel}>App Version</Text>
                  <Text style={styles.versionValue}>
                    v{Constants.expoConfig?.version ?? "0.0.0"}
                  </Text>
                </View>
                <View style={styles.versionRow}>
                  <Text style={styles.settingsLabel}>Build Number</Text>
                  <Text style={styles.versionValue}>
                    {String(
                      Constants.expoConfig?.ios?.buildNumber ??
                        Constants.expoConfig?.android?.versionCode ??
                        "N/A"
                    )}
                  </Text>
                </View>
                <Text style={styles.inlineHint}>
                  Built with {"\u2764\ufe0f"} for mindful conversations
                </Text>
                <Pressable style={styles.settingsButton} onPress={handleSendFeedback}>
                  <Text style={styles.settingsButtonText}>Send Feedback</Text>
                </Pressable>
                <Pressable style={styles.settingsButton} onPress={handleRateApp}>
                  <Text style={styles.settingsButtonText}>Rate App</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 9,
  },

  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "70%",
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    zIndex: 10,
  },

  panelContent: {
    alignItems: "center",
  },

  panelButton: {
    ...panelButtonStyle,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#1E1E1E",
  },

  panelButtonText: {
    fontSize: 15,
    color: "#EAEAEA",
    fontWeight: "600",
  },

  panelPlaceholder: {
    ...panelButtonStyle,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 20,
  },

  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },

  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  modalHeaderTitle: {
    marginBottom: 0,
    flexShrink: 1,
  },

  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  backText: {
    fontSize: 18,
    color: "#dcdcdc",
  },

  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
  },

  closeText: {
    color: "#e5e5e5",
    fontSize: 18,
    lineHeight: 18,
  },

  sectionHeader: {
    paddingVertical: 10,
  },

  sectionText: {
    fontSize: 16,
    color: "#dcdcdc",
  },

  sessionList: {
    marginLeft: 6,
    marginTop: 4,
    gap: 6,
  },

  sessionRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#252525",
  },

  sessionTime: {
    fontSize: 13,
    color: "#9a9a9a",
  },

  pastWrapper: {
    marginTop: 6,
    gap: 6,
  },

  pillButton: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1b1b1b",
  },

  pillText: {
    fontSize: 14,
    color: "#dcdcdc",
  },

  modalLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  viewer: {
    flex: 1,
    marginTop: 6,
  },

  viewerContent: {
    paddingBottom: 80,
    gap: 12,
  },

  historyContent: {
    paddingBottom: 40,
  },

  settingsContent: {
    paddingBottom: 44,
    gap: 10,
  },

  settingsSectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b8b8b8",
    marginTop: 6,
  },

  settingsCard: {
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 12,
    backgroundColor: "#151515",
    padding: 10,
    gap: 8,
  },

  profileRow: {
    paddingVertical: 4,
  },

  profileName: {
    fontSize: 15,
    color: "#f0f0f0",
    fontWeight: "600",
  },

  profileEmail: {
    fontSize: 13,
    color: "#9d9d9d",
    marginTop: 2,
  },

  settingsRow: {
    gap: 8,
  },

  settingsLabel: {
    fontSize: 13,
    color: "#cdcdcd",
  },

  segmentedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  segmentButton: {
    borderWidth: 1,
    borderColor: "#2d2d2d",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#1a1a1a",
  },

  segmentButtonActive: {
    borderColor: "#3f6cff",
    backgroundColor: "#1d2a57",
  },

  segmentText: {
    fontSize: 12,
    color: "#d5d5d5",
    fontWeight: "500",
  },

  segmentTextActive: {
    color: "#dce4ff",
  },

  dropdownButton: {
    borderWidth: 1,
    borderColor: "#2d2d2d",
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  dropdownText: {
    fontSize: 13,
    color: "#dddddd",
  },

  dropdownList: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#141414",
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#252525",
  },

  dropdownItemText: {
    fontSize: 13,
    color: "#d2d2d2",
  },

  settingsButton: {
    borderWidth: 1,
    borderColor: "#2c2c2c",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#1a1a1a",
  },

  settingsButtonText: {
    fontSize: 13,
    color: "#e1e1e1",
    fontWeight: "500",
  },

  destructiveButton: {
    borderColor: "#4a2424",
    backgroundColor: "#2a1717",
  },

  destructiveText: {
    fontSize: 13,
    color: "#ffb7b7",
    fontWeight: "600",
  },

  linkText: {
    fontSize: 13,
    color: "#9ec2ff",
    fontWeight: "500",
  },

  disabledButton: {
    opacity: 0.45,
  },

  disabledText: {
    fontSize: 13,
    color: "#9a9a9a",
    fontWeight: "500",
  },

  inlineHint: {
    fontSize: 12,
    color: "#8fb0ff",
    marginTop: -2,
  },

  versionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },

  versionValue: {
    fontSize: 13,
    color: "#d7d7d7",
  },

  confirmLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },

  confirmCard: {
    width: "78%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2c2c2c",
    backgroundColor: "#181818",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },

  confirmTitle: {
    fontSize: 16,
    color: "#f2f2f2",
    fontWeight: "600",
  },

  confirmBody: {
    fontSize: 13,
    color: "#a6a6a6",
    lineHeight: 18,
  },

  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 2,
  },

  confirmButton: {
    borderWidth: 1,
    borderColor: "#2d2d2d",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#1a1a1a",
  },

  messageRow: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#151515",
  },

  messageMeta: {
    fontSize: 12,
    color: "#9a9a9a",
    marginBottom: 4,
  },

  messageText: {
    fontSize: 14,
    color: "#e6e6e6",
  },

  modalCard: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "10%",
    height: "72%",
    backgroundColor: "#181818",
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#242424",
  },
})
