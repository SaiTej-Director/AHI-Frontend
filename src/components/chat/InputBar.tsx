import React, { useState } from "react"
import { View, TextInput, Pressable, Text, Platform } from "react-native"

type Props = {
  onSend: (text: string) => void
  disabled?: boolean
  isDeleteMode?: boolean
  onDeleteSelected?: () => void
}

export default function InputBar({
  onSend,
  disabled,
  isDeleteMode,
  onDeleteSelected,
}: Props) {
  const [text, setText] = useState("")

  function send() {
    if (isDeleteMode) {
      onDeleteSelected?.()
      return
    }
    if (!text.trim()) return
    onSend(text)
    setText("")
  }

  function handleWebKeyPress(e: {
    nativeEvent: { key?: string; shiftKey?: boolean; preventDefault?: () => void }
    preventDefault?: () => void
  }) {
    if (Platform.OS !== "web") return
    if (e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
      e.preventDefault?.()
      e.nativeEvent.preventDefault?.()
      send()
    }
  }

  return (
    <View
      style={{
        flexDirection: "column",
        borderTopWidth: 1,
        borderColor: "#1f1f1f",
        backgroundColor: "#121212",
      }}
    >
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <TextInput
            value={text}
            onChangeText={setText}
            editable={!disabled}
            placeholder="Type here…"
            placeholderTextColor="#777"
            multiline
            scrollEnabled={false} // 🔥 THIS IS THE KEY
            onKeyPress={handleWebKeyPress}
            style={{
              flex: 1,
              minHeight: 48,
              maxHeight: 140,
              color: "#fff",
              fontSize: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: "#121212",
              borderRadius: 14,
            }}
          />

          <Pressable
            onPress={send}
            style={{
              marginLeft: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#4da6ff", fontSize: 16 }}>Send</Text>
          </Pressable>
        </View>

      </View>
    </View>
  )
}
