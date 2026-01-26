import React, { useState } from "react"
import { View, TextInput, Pressable, Text } from "react-native"

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

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: "#1f1f1f",
        backgroundColor: "#121212",
      }}
    >
      <TextInput
  value={text}
  onChangeText={setText}
  editable={!disabled}
  placeholder="Type here…"
  placeholderTextColor="#777"
  multiline
  scrollEnabled={false}   // 🔥 THIS IS THE KEY
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
  )
}
