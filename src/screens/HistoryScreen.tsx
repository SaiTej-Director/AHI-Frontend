import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { loadHistory, deleteConversation, Conversation } from "../storage/history"
import { useNavigation } from "@react-navigation/native"

export default function HistoryScreen() {
  const [history, setHistory] = useState<Conversation[]>([])
  const navigation = useNavigation<any>()

  useEffect(() => {
    loadHistory().then(setHistory)
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const todays = history.filter(h => h.date === today)
  const past = history.filter(h => h.date !== today)

  function openConversation(conv: Conversation) {
    navigation.navigate("SessionViewer", { conversation: conv })
  }

  function renderItem(c: Conversation) {
    return (
      <TouchableOpacity
        key={c.id}
        onPress={() => openConversation(c)}
        style={{
          padding: 14,
          borderBottomWidth: 1,
          borderColor: "#2A2A2A"
        }}
      >
        <Text style={{ color: "#EAEAEA" }}>
          {c.messages[0]?.text || "Empty chat"}
        </Text>

        <TouchableOpacity
          onPress={() => deleteConversation(c.id)}
        >
          <Text style={{ color: "#FF6B6B", marginTop: 6 }}>
            Delete
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <Text style={{ color: "#AAA", padding: 12 }}>Today</Text>
      {todays.map(renderItem)}

      <Text style={{ color: "#AAA", padding: 12 }}>Past</Text>
      {past.map(renderItem)}
    </View>
  )
}
