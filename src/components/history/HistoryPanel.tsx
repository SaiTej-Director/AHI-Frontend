// AHI UI V1 — Layout & Interaction Locked
import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Conversation,
  getEarlierSessions,
  getTodaySessions,
  getYesterdaySessions,
  loadHistory,
  deleteConversation,
  deleteByPredicate,
} from "../../storage/history"

type Props = {
  visible: boolean
  onClose: () => void
  onOpen?: (conversation: Conversation) => void
}

type ThemeOption = "Light" | "Dark" | "System"
type FontSizeOption = "Small" | "Default" | "Large"
type ResponseLengthOption = "Short" | "Balanced" | "Detailed"
type HumorLevelOption = "Low" | "Normal" | "Playful"

export default function HistoryPanel({ visible, onClose, onOpen }: Props) {
  const insets = useSafeAreaInsets()

  const [historyVisible, setHistoryVisible] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const keepModalOnCloseRef = useRef(false)
  const [historyOpen, setHistoryOpen] = useState(true)
  const [todayOpen, setTodayOpen] = useState(false)
  const [pastOpen, setPastOpen] = useState(false)
  const [todaySessions, setTodaySessions] = useState<Conversation[]>([])
  const [yesterdaySessions, setYesterdaySessions] = useState<Conversation[]>(
    []
  )
  const [earlierSessions, setEarlierSessions] = useState<Conversation[]>([])
  const [selectedSession, setSelectedSession] =
    useState<Conversation | null>(null)
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] =
    useState(false)
  const [theme, setTheme] = useState<ThemeOption>("System")
  const [languageOpen, setLanguageOpen] = useState(false)
  const [language, setLanguage] = useState("English")
  const [fontSize, setFontSize] = useState<FontSizeOption>("Default")
  const [chatHistoryCleared, setChatHistoryCleared] = useState(false)
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
        setShowDeleteAccountConfirm(false)
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
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const suffix = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 === 0 ? 12 : hours % 12
    return `${hour12}:${minutes} ${suffix}`
  }

  function handleClearChatHistory() {
    setChatHistoryCleared(true)
    Alert.alert("Chat history cleared", "Local UI state updated only.")
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
            </View>
          </View>
        </>
      )}

      {/* History modal */}
      {historyVisible && (
        <View style={styles.modalLayer}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setHistoryVisible(false)}
          />
          <View
            style={[
              styles.modalCard,
              {
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            {selectedSession ? (
              <View style={styles.headerRow}>
                <Pressable
                  onPress={() => setSelectedSession(null)}
                  style={styles.backButton}
                  hitSlop={8}
                >
                  <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.title}>History</Text>
              </View>
            ) : (
              <Pressable onPress={() => setHistoryOpen(v => !v)}>
                <Text style={styles.title}>
                  History {historyOpen ? "▾" : "▸"}
                </Text>
              </Pressable>
            )}

            {selectedSession ? (
              <ScrollView
                style={styles.viewer}
                contentContainerStyle={styles.viewerContent}
                showsVerticalScrollIndicator={false}
              >
                {selectedSession.messages.map(msg => (
                  <View key={msg.id} style={styles.messageRow}>
                    <Text style={styles.messageMeta}>
                      {formatTime(msg.timestamp)} •{" "}
                      {msg.sender === "user" ? "You" : "ahi"}
                    </Text>
                    <Text style={styles.messageText}>{msg.text}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ScrollView
                style={styles.viewer}
                contentContainerStyle={styles.historyContent}
                showsVerticalScrollIndicator={false}
              >
                {historyOpen && (
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
                        {todaySessions.length === 0 ? (
                          <Text style={styles.placeholder}>No sessions</Text>
                        ) : (
                          todaySessions.map(session => (
                            <Pressable
                              key={session.id}
                              style={styles.sessionRow}
                              onPress={() => openSession(session)}
                              onLongPress={() => confirmDelete(session.id)}
                            >
                              <Text style={styles.sessionTime}>
                                {formatTime(session.lastUpdatedAt)}
                              </Text>
                            </Pressable>
                          ))
                        )}
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
                            confirmDeleteMerged(
                              yesterdaySessions,
                              "yesterday-merged"
                            )
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
                            confirmDeleteMerged(
                              earlierSessions,
                              "earlier-merged"
                            )
                          }
                        >
                          <Text style={styles.pillText}>
                            Earlier ({earlierSessions.length})
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* Settings modal */}
      {settingsVisible && (
        <View style={styles.modalLayer}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSettingsVisible(false)}
          />
          <View
            style={[
              styles.modalCard,
              {
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            <Text style={styles.title}>Settings</Text>
            <ScrollView
              style={styles.viewer}
              contentContainerStyle={styles.settingsContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.settingsSectionHeader}>Account</Text>
              <View style={styles.settingsCard}>
                <View style={styles.profileRow}>
                  <Text style={styles.profileName}>AHI User</Text>
                  <Text style={styles.profileEmail}>user@ahi.app</Text>
                </View>
                <Pressable style={styles.settingsButton}>
                  <Text style={styles.settingsButtonText}>Logout</Text>
                </Pressable>
                <Pressable
                  style={[styles.settingsButton, styles.destructiveButton]}
                  onPress={() => setShowDeleteAccountConfirm(true)}
                >
                  <Text style={styles.destructiveText}>Delete Account</Text>
                </Pressable>
              </View>

              <Text style={styles.settingsSectionHeader}>Chat Preferences</Text>
              <View style={styles.settingsCard}>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Theme</Text>
                  <View style={styles.segmentedRow}>
                    {(["Light", "Dark", "System"] as ThemeOption[]).map(
                      option => (
                        <Pressable
                          key={option}
                          style={[
                            styles.segmentButton,
                            theme === option && styles.segmentButtonActive,
                          ]}
                          onPress={() => setTheme(option)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              theme === option && styles.segmentTextActive,
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
                  <Text style={styles.settingsLabel}>Language</Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => setLanguageOpen(v => !v)}
                  >
                    <Text style={styles.dropdownText}>
                      {language} {languageOpen ? "▴" : "▾"}
                    </Text>
                  </Pressable>
                  {languageOpen && (
                    <View style={styles.dropdownList}>
                      {["English", "Spanish", "French", "Hindi"].map(option => (
                        <Pressable
                          key={option}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setLanguage(option)
                            setLanguageOpen(false)
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              language === option && styles.segmentTextActive,
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
                  <Text style={styles.settingsLabel}>Font Size</Text>
                  <View style={styles.segmentedRow}>
                    {(["Small", "Default", "Large"] as FontSizeOption[]).map(
                      option => (
                        <Pressable
                          key={option}
                          style={[
                            styles.segmentButton,
                            fontSize === option && styles.segmentButtonActive,
                          ]}
                          onPress={() => setFontSize(option)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              fontSize === option && styles.segmentTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </View>
                </View>

                <Pressable
                  style={styles.settingsButton}
                  onPress={handleClearChatHistory}
                >
                  <Text style={styles.settingsButtonText}>Clear Chat History</Text>
                </Pressable>
                {chatHistoryCleared && (
                  <Text style={styles.inlineHint}>History cleared locally</Text>
                )}
              </View>

              <Text style={styles.settingsSectionHeader}>AHI Behavior</Text>
              <View style={styles.settingsCard}>
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

              <Text style={styles.settingsSectionHeader}>Privacy & Data</Text>
              <View style={styles.settingsCard}>
                <Pressable style={styles.settingsButton}>
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Pressable>
                <Pressable style={styles.settingsButton}>
                  <Text style={styles.linkText}>Terms of Service</Text>
                </Pressable>
                <Pressable style={styles.settingsButton}>
                  <Text style={styles.settingsButtonText}>App Permissions</Text>
                </Pressable>
                <Pressable
                  style={[styles.settingsButton, styles.disabledButton]}
                  disabled
                >
                  <Text style={styles.disabledText}>Export Chat (Coming Soon)</Text>
                </Pressable>
              </View>

              <Text style={styles.settingsSectionHeader}>About</Text>
              <View style={styles.settingsCard}>
                <View style={styles.versionRow}>
                  <Text style={styles.settingsLabel}>App Version</Text>
                  <Text style={styles.versionValue}>v0.0.0</Text>
                </View>
                <Pressable style={styles.settingsButton}>
                  <Text style={styles.settingsButtonText}>Check for Updates</Text>
                </Pressable>
                <Pressable style={styles.settingsButton}>
                  <Text style={styles.settingsButtonText}>Send Feedback</Text>
                </Pressable>
                <Pressable style={styles.settingsButton}>
                  <Text style={styles.settingsButtonText}>Rate App</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>

          {showDeleteAccountConfirm && (
            <View style={styles.confirmLayer}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setShowDeleteAccountConfirm(false)}
              />
              <View style={styles.confirmCard}>
                <Text style={styles.confirmTitle}>Delete account?</Text>
                <Text style={styles.confirmBody}>
                  This is UI-only for now and will not delete your account.
                </Text>
                <View style={styles.confirmActions}>
                  <Pressable
                    style={styles.confirmButton}
                    onPress={() => setShowDeleteAccountConfirm(false)}
                  >
                    <Text style={styles.settingsButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.confirmButton, styles.destructiveButton]}
                    onPress={() => setShowDeleteAccountConfirm(false)}
                  >
                    <Text style={styles.destructiveText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
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
    flex: 1,
    justifyContent: "space-between",
  },

  panelButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#1E1E1E",
  },

  panelButtonText: {
    fontSize: 15,
    color: "#EAEAEA",
    fontWeight: "600",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  backText: {
    fontSize: 18,
    color: "#dcdcdc",
  },

  sectionHeader: {
    paddingVertical: 10,
  },

  sectionText: {
    fontSize: 16,
    color: "#dcdcdc",
  },

  placeholder: {
    fontSize: 13,
    color: "#8a8a8a",
    marginLeft: 6,
    marginTop: 4,
  },

  sessionList: {
    marginLeft: 6,
    marginTop: 4,
    gap: 6,
  },

  sessionRow: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#252525",
  },

  sessionTime: {
    fontSize: 14,
    color: "#e2e2e2",
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
