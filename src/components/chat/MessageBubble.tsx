// AHI UI V1 — Layout & Interaction Locked
import React from "react"
import { Text, Pressable, View } from "react-native"
import { Message } from "../../storage/history"

type Props = {
  message: Message
  isSelected: boolean
  onPress: () => void
  onLongPress: () => void
}

export default function MessageBubble({
  message,
  isSelected,
  onPress,
  onLongPress,
}: Props) {
  const isUser = message.role === "user"
  const text = message.content ?? ""

  // USER: text in space (no bubble)
  if (isUser) {
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress}>
        <View
          style={{
            alignSelf: "flex-end",
            marginVertical: 4,
            marginRight: 6,
            maxWidth: "80%",
            opacity: isSelected ? 0.6 : 1,
            position: "relative",
            paddingHorizontal: isSelected ? 10 : 0,
            paddingVertical: isSelected ? 6 : 0,
            borderWidth: isSelected ? 1.5 : 0,
            borderColor: isSelected ? "rgba(59,130,246,0.5)" : "transparent",
            borderRadius: 8,
            backgroundColor: isSelected ? "rgba(59,130,246,0.08)" : "transparent",
          }}
        >
          <Text
            style={{
              color: "#eaeaea",
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {text}
          </Text>
        </View>
      </Pressable>
    )
  }

  // AHI: soft presence bubble
  console.log("[FRONTEND RENDER]", message.content);
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <View
        style={{
          alignSelf: "flex-start",
          marginVertical: 4,
          marginLeft: 6,
          maxWidth: "80%",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isSelected ? "rgba(59,130,246,0.5)" : "rgba(220,220,220,0.25)",
          backgroundColor: isSelected ? "rgba(59,130,246,0.08)" : "transparent",
          opacity: isSelected ? 0.6 : 1,
          position: "relative",
        }}
      >
        <Text
          style={{
            color: "#dcdcdc",
            fontSize: 15.5,
            lineHeight: 22,
          }}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  )
}
