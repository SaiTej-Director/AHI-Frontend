// AHI UI V1 — Layout & Interaction Locked
import React from "react"
import { Text, Pressable, View } from "react-native"
import { Message } from "../../storage/history"
import { getChatFontScale, useAppearance } from "../../context/AppearanceContext"

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
  const { chatFontSize, resolvedTheme } = useAppearance()
  const scale = getChatFontScale(chatFontSize)
  const isUser = message.role === "user"
  const text = message.content ?? ""
  const userTextColor = resolvedTheme === "light" ? "#1F1F1F" : "#eaeaea"
  const ahiTextColor = resolvedTheme === "light" ? "#202020" : "#dcdcdc"
  const ahiBorder = resolvedTheme === "light" ? "rgba(0,0,0,0.2)" : "rgba(220,220,220,0.25)"

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
              color: userTextColor,
              fontSize: 16 * scale,
              lineHeight: 22 * scale,
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
          borderColor: isSelected ? "rgba(59,130,246,0.5)" : ahiBorder,
          backgroundColor: isSelected ? "rgba(59,130,246,0.08)" : "transparent",
          opacity: isSelected ? 0.6 : 1,
          position: "relative",
        }}
      >
        <Text
          style={{
            color: ahiTextColor,
            fontSize: 15.5 * scale,
            lineHeight: 22 * scale,
          }}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  )
}
