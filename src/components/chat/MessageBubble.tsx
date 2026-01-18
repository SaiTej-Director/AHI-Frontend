import React from "react"
import { View, Text, StyleSheet } from "react-native"

type Message = {
  id: string
  sender: "user" | "ahi"
  text: string
}

type Props = {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isAhi = message.sender === "ahi"

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.container,
          isAhi ? styles.ahiBubble : styles.userContainer
        ]}
      >
        <Text
          style={[
            styles.text,
            isAhi ? styles.ahiText : styles.userText
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    alignItems: "flex-end",
    marginVertical: 12
  },

  container: {
    maxWidth: "82%",
  },

  /* AHI bubble */
  ahiBubble: {
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18
  },

  /* User message (no bubble) */
  userContainer: {
    paddingHorizontal: 4,
    paddingVertical: 2
  },

  text: {
    color: "#EAEAEA"
  },

  ahiText: {
    fontSize: 19,
    lineHeight: 28,
    fontWeight: "400"
  },

  userText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "400"
  }
})
