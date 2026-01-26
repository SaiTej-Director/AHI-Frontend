// AHI UI V1 — Layout & Interaction Locked
import React, { useEffect, useState } from "react"
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

export default function HistoryPanel({ visible, onClose, onOpen }: Props) {
  const insets = useSafeAreaInsets()

  const [historyVisible, setHistoryVisible] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)
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
      setHistoryVisible(false)
      setSettingsVisible(false)
      setSelectedSession(null)
    }
  }, [visible])

  useEffect(() => {
    if (!historyVisible) {
      setSelectedSession(null)
      return
    }
    refreshSessions()
  }, [historyVisible])

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

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.panel}>
        <View style={styles.panelContent}>
          <Pressable
            style={styles.panelButton}
            onPress={() => setHistoryVisible(true)}
          >
            <Text style={styles.panelButtonText}>History</Text>
          </Pressable>

          <Pressable
            style={styles.panelButton}
            onPress={() => setSettingsVisible(true)}
          >
            <Text style={styles.panelButtonText}>Settings</Text>
          </Pressable>
        </View>
      </View>

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
            <Text style={styles.placeholder}>
              Settings will live here.
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
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
