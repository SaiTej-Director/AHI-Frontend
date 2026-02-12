import React, { useState } from "react"
import { View, TextInput, Pressable, Text, Platform } from "react-native"
import { getChatFontScale, useAppearance } from "../../context/AppearanceContext"

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
  const { chatFontSize, resolvedTheme } = useAppearance()
  const scale = getChatFontScale(chatFontSize)
  const containerColor = resolvedTheme === "light" ? "#FFFFFF" : "#121212"
  const borderColor = resolvedTheme === "light" ? "#DADADA" : "#1f1f1f"
  const textColor = resolvedTheme === "light" ? "#1D1D1D" : "#fff"
  const placeholderColor = resolvedTheme === "light" ? "#8A8A8A" : "#777"
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
        borderColor,
        backgroundColor: containerColor,
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
            placeholderTextColor={placeholderColor}
            multiline
            scrollEnabled={false} // 🔥 THIS IS THE KEY
            onKeyPress={handleWebKeyPress}
            style={{
              flex: 1,
              minHeight: 48,
              maxHeight: 140,
              color: textColor,
              fontSize: 16 * scale,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: containerColor,
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
