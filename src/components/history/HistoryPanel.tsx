import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native"

import { loadHistory, Conversation, Message } from "../../storage/history"

/* -----------------------------
   Helpers
------------------------------ */

function startOfToday() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function isToday(ts: number) {
  return ts >= startOfToday()
}

function isYesterday(ts: number) {
  const today = startOfToday()
  return ts >= today - 24 * 60 * 60 * 1000 && ts < today
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/* -----------------------------
   Component
------------------------------ */

type Props = {
  visible: boolean
  onClose: () => void
}

export default function HistoryPanel({ visible, onClose }: Props) {
  const [history, setHistory] = useState<Conversation[]>([])

  const [openHistory, setOpenHistory] = useState(false)
  const [openToday, setOpenToday] = useState(false)
  const [openPast, setOpenPast] = useState(false)

  const [viewing, setViewing] = useState<{
    title: string
    messages: Message[]
  } | null>(null)

  useEffect(() => {
    if (visible) {
      loadHistory().then(setHistory)
      setOpenHistory(false)
      setOpenToday(false)
      setOpenPast(false)
      setViewing(null)
    }
  }, [visible])

  if (!visible) return null

  const todaySessions = history.filter(c => isToday(c.startedAt))
  const yesterdaySessions = history.filter(c => isYesterday(c.startedAt))
  const earlierSessions = history.filter(
    c => !isToday(c.startedAt) && !isYesterday(c.startedAt)
  )

  /* -----------------------------
     READ-ONLY SESSION VIEW
  ------------------------------ */

  if (viewing) {
    return (
      <View style={styles.overlay}>
        {/* BACKDROP */}
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        {/* PANEL */}
        <View style={styles.panel}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setViewing(null)}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{viewing.title}</Text>
          </View>

          <ScrollView style={{ padding: 16 }}>
            {viewing.messages.map(m => (
              <Text key={m.id} style={styles.readOnlyText}>
                {m.sender === "user" ? "You: " : "AHI: "}
                {m.text}
              </Text>
            ))}
          </ScrollView>
        </View>
      </View>
    )
  }

  /* -----------------------------
     LIST VIEW
  ------------------------------ */

  return (
    <View style={styles.overlay}>
      {/* BACKDROP — LEFT */}
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* PANEL — RIGHT */}
      <View style={styles.panel}>
        <ScrollView>
          {/* HISTORY */}
          <TouchableOpacity
            style={styles.section}
            onPress={() => setOpenHistory(v => !v)}
          >
            <Text style={styles.title}>History</Text>
          </TouchableOpacity>

          {openHistory && (
            <>
              {/* TODAY */}
              <TouchableOpacity
                style={styles.subSection}
                onPress={() => setOpenToday(v => !v)}
              >
                <Text style={styles.subTitle}>Today</Text>
              </TouchableOpacity>

              {openToday &&
                todaySessions.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.item}
                    onPress={() =>
                      setViewing({
                        title: formatTime(s.startedAt),
                        messages: s.messages,
                      })
                    }
                  >
                    <Text style={styles.itemText}>
                      {formatTime(s.startedAt)}
                    </Text>
                  </TouchableOpacity>
                ))}

              {/* PAST */}
              <TouchableOpacity
                style={styles.subSection}
                onPress={() => setOpenPast(v => !v)}
              >
                <Text style={styles.subTitle}>Past</Text>
              </TouchableOpacity>

              {openPast && (
                <>
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() =>
                      setViewing({
                        title: "Yesterday",
                        messages: yesterdaySessions.flatMap(
                          c => c.messages
                        ),
                      })
                    }
                  >
                    <Text style={styles.itemText}>Yesterday</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.item}
                    onPress={() =>
                      setViewing({
                        title: "Earlier Days",
                        messages: earlierSessions.flatMap(
                          c => c.messages
                        ),
                      })
                    }
                  >
                    <Text style={styles.itemText}>Earlier Days</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

/* -----------------------------
   Styles
------------------------------ */

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    zIndex: 20,
  },
  panel: {
    width: "50%",
    backgroundColor: "#1b1b1b",
  },
  backdrop: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  back: {
    color: "#aaa",
    marginBottom: 8,
  },
  section: {
    padding: 16,
  },
  subSection: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  subTitle: {
    color: "#cccccc",
    fontSize: 15,
  },
  item: {
    paddingLeft: 40,
    paddingVertical: 8,
  },
  itemText: {
    color: "#999999",
    fontSize: 14,
  },
  readOnlyText: {
    color: "#dddddd",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
})
