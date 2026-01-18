import React, { useState } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

type Props = {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function InputBar({ onSend, disabled }: Props) {
  const [text, setText] = useState("")

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setText("")
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type here…"
          placeholderTextColor="#8A8A8A"
          style={styles.input}
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="send"
          blurOnSubmit={Platform.OS !== "web"}
          onSubmitEditing={() => {
            if (Platform.OS !== "web") handleSend()
          }}
        />

        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.7}
          style={styles.sendButton}
        >
          <Ionicons
            name="send"
            size={24}
            color={text.trim() ? "#EAEAEA" : "#666666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingBottom: 12
  },

  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#1E1E1E",
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 52
  },

  input: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: "#EAEAEA",
    padding: 0,
    margin: 0
  },

  sendButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6
  }
})
